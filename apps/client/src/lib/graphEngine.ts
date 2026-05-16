import type { GraphSimulationState } from './sceneMath';

interface GraphNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  readonly cluster: number;
  readonly orbitPhase: number;
}

interface GraphEdge {
  readonly a: number;
  readonly b: number;
}

export class GraphEngine {
  private width: number = 1;
  private height: number = 1;
  private readonly nodes: GraphNode[] = [];
  private readonly edges: GraphEdge[] = [];
  private timeSec: number = 0;
  private pointerX: number | null = null;
  private pointerY: number | null = null;

  public constructor(nodeCount: number) {
    for (let i = 0; i < nodeCount; i += 1) {
      const angle: number = (i / nodeCount) * Math.PI * 2;
      const r: number = 120 + (i % 7) * 28;
      this.nodes.push({
        x: Math.cos(angle) * r + (Math.random() - 0.5) * 40,
        y: Math.sin(angle) * r * 0.85 + (Math.random() - 0.5) * 40,
        vx: 0,
        vy: 0,
        cluster: i % 4,
        orbitPhase: i * 0.37,
      });
    }
    for (let i = 0; i < nodeCount; i += 1) {
      const b: number = (i * 3 + 5) % nodeCount;
      if (b !== i) {
        this.edges.push({ a: i, b });
      }
      const c: number = (i + 7) % nodeCount;
      if (c !== i) {
        this.edges.push({ a: i, b: c });
      }
    }
  }

  public setSize(width: number, height: number): void {
    this.width = width;
    this.height = height;
  }

  public setPointer(normX: number | null, normY: number | null): void {
    this.pointerX = normX;
    this.pointerY = normY;
  }

  public step(
    dt: number,
    state: GraphSimulationState,
    ctaOrbit: number,
  ): void {
    this.timeSec += dt;
    const cx: number = this.width * 0.5;
    const cy: number = this.height * 0.5;
    const n: number = this.nodes.length;
    const repBase: number =
      4200 *
      (0.55 + state.density * 0.9) *
      (1 + state.interactionBoost * 0.35);
    const centerPull: number =
      0.0009 * state.structureLevel * (0.4 + state.coherence * 1.4);
    const chaosPush: number =
      2.8 * state.chaosLevel * (0.35 + Math.sin(this.timeSec * 1.1) * 0.15);
    const damping: number = 0.88 + state.coherence * 0.08;
    const microLerp: number =
      0.012 + state.density * 0.018 + state.flowEmphasis * 0.012;
    const clusterStrength: number =
      0.00035 * state.structureLevel * (0.5 + state.aiMagic * 1.2);

    const clusterCx: number[] = [cx - 90, cx + 100, cx - 40, cx + 70];
    const clusterCy: number[] = [cy - 70, cy - 50, cy + 90, cy + 60];

    for (let i = 0; i < n; i += 1) {
      const node: GraphNode = this.nodes[i] as GraphNode;
      let fx: number = 0;
      let fy: number = 0;

      for (let j = 0; j < n; j += 1) {
        if (i === j) {
          continue;
        }
        const other: GraphNode = this.nodes[j] as GraphNode;
        const dx: number = node.x - other.x;
        const dy: number = node.y - other.y;
        const dist2: number = dx * dx + dy * dy + 80;
        const rep: number = repBase / dist2;
        fx += (dx / Math.sqrt(dist2)) * rep;
        fy += (dy / Math.sqrt(dist2)) * rep;
      }

      fx += (cx - node.x) * centerPull;
      fy += (cy - node.y) * centerPull;

      const targetX: number = clusterCx[node.cluster] as number;
      const targetY: number = clusterCy[node.cluster] as number;
      fx += (targetX - node.x) * clusterStrength;
      fy += (targetY - node.y) * clusterStrength;

      fx += (Math.random() - 0.5) * chaosPush;
      fy += (Math.random() - 0.5) * chaosPush;

      fx +=
        Math.sin(this.timeSec * 0.7 + node.orbitPhase) * microLerp * this.width;
      fy +=
        Math.cos(this.timeSec * 0.55 + node.orbitPhase * 1.3) *
        microLerp *
        this.height;

      if (this.pointerX !== null && this.pointerY !== null) {
        const px: number = this.pointerX * this.width;
        const py: number = this.pointerY * this.height;
        const ddx: number = px - node.x;
        const ddy: number = py - node.y;
        const d2: number = ddx * ddx + ddy * ddy + 4000;
        const pull: number = 0.00015 * (1 - state.chaosLevel * 0.5);
        fx += (ddx / d2) * this.width * pull * 8000;
        fy += (ddy / d2) * this.height * pull * 8000;
      }

      if (ctaOrbit > 0.01) {
        const ang: number =
          this.timeSec * (0.35 + ctaOrbit * 0.9) + node.orbitPhase;
        const ring: number = Math.min(this.width, this.height) * 0.36;
        const ox: number = cx + Math.cos(ang) * ring * ctaOrbit;
        const oy: number = cy + Math.sin(ang) * ring * ctaOrbit * 0.88;
        fx += (ox - node.x) * 0.00025 * ctaOrbit;
        fy += (oy - node.y) * 0.00025 * ctaOrbit;
      }

      node.vx = (node.vx + fx * dt) * damping;
      node.vy = (node.vy + fy * dt) * damping;
      node.x += node.vx * dt;
      node.y += node.vy * dt;
    }

    for (const edge of this.edges) {
      const na: GraphNode = this.nodes[edge.a] as GraphNode;
      const nb: GraphNode = this.nodes[edge.b] as GraphNode;
      const dx: number = nb.x - na.x;
      const dy: number = nb.y - na.y;
      const dist: number = Math.sqrt(dx * dx + dy * dy) + 0.01;
      const rest: number = 120 + state.structureLevel * 40;
      const k: number =
        0.00012 * (0.3 + state.density) * (0.4 + state.coherence);
      const force: number = (dist - rest) * k;
      const fx: number = (dx / dist) * force;
      const fy: number = (dy / dist) * force;
      na.vx += fx * dt;
      na.vy += fy * dt;
      nb.vx -= fx * dt;
      nb.vy -= fy * dt;
    }
  }

  public draw(
    ctx: CanvasRenderingContext2D,
    state: GraphSimulationState,
    ctaOrbit: number,
    resolvedDark: boolean,
  ): void {
    const w: number = this.width;
    const h: number = this.height;
    ctx.clearRect(0, 0, w, h);

    const activityPulse: number = 0.35 + state.activity * 0.65;
    const edgeAlpha: number =
      0.08 + state.density * 0.22 + state.structureLevel * 0.15;

    ctx.save();
    ctx.globalAlpha = edgeAlpha * activityPulse;
    ctx.lineWidth = 1 + state.density * 0.8;
    for (const edge of this.edges) {
      const na: GraphNode = this.nodes[edge.a] as GraphNode;
      const nb: GraphNode = this.nodes[edge.b] as GraphNode;
      ctx.beginPath();
      if (resolvedDark) {
        ctx.strokeStyle =
          state.aiMagic > 0.2
            ? `rgba(34,211,238,${0.15 + state.aiMagic * 0.35})`
            : 'rgba(139,92,246,0.28)';
      } else {
        ctx.strokeStyle =
          state.aiMagic > 0.2
            ? `rgba(8,145,178,${0.18 + state.aiMagic * 0.32})`
            : 'rgba(109,40,217,0.26)';
      }
      ctx.moveTo(na.x, na.y);
      ctx.lineTo(nb.x, nb.y);
      if (state.aiMagic > 0.35) {
        ctx.setLineDash([2, 6 + state.aiMagic * 8]);
      } else {
        ctx.setLineDash([]);
      }
      ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.restore();

    for (let i = 0; i < this.nodes.length; i += 1) {
      const node: GraphNode = this.nodes[i] as GraphNode;
      const hueBase: number = 260 + node.cluster * 28 + state.aiMagic * 40;
      const r: number = 5 + state.density * 2.5 + state.structureLevel * 1.2;
      ctx.beginPath();
      const grad: CanvasGradient = ctx.createRadialGradient(
        node.x,
        node.y,
        0,
        node.x,
        node.y,
        r * 4,
      );
      if (resolvedDark) {
        grad.addColorStop(0, `hsla(${hueBase},85%,70%,0.95)`);
        grad.addColorStop(0.35, `hsla(${hueBase},70%,45%,0.45)`);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
      } else {
        grad.addColorStop(0, `hsla(${hueBase},78%,52%,0.92)`);
        grad.addColorStop(0.35, `hsla(${hueBase},65%,42%,0.38)`);
        grad.addColorStop(1, 'rgba(255,255,255,0)');
      }
      ctx.fillStyle = grad;
      ctx.arc(node.x, node.y, r * 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.fillStyle = resolvedDark
        ? `hsla(${hueBase},80%,58%,0.92)`
        : `hsla(${hueBase},72%,42%,0.94)`;
      ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    if (state.activity > 0.08) {
      ctx.save();
      ctx.globalAlpha = 0.25 + state.activity * 0.35;
      for (let g = 0; g < 3; g += 1) {
        const gx: number =
          w * (0.2 + g * 0.22) +
          Math.sin(this.timeSec * 1.4 + g) * 18 * state.activity;
        const gy: number =
          h * (0.35 + g * 0.1) +
          Math.cos(this.timeSec * 1.1 + g * 2) * 14 * state.activity;
        ctx.fillStyle = resolvedDark
          ? 'rgba(250,250,250,0.9)'
          : 'rgba(30,41,59,0.72)';
        ctx.beginPath();
        ctx.arc(gx, gy, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    if (ctaOrbit > 0.05) {
      ctx.save();
      ctx.globalAlpha = 0.12 + ctaOrbit * 0.25;
      ctx.strokeStyle = resolvedDark
        ? 'rgba(167,139,250,0.5)'
        : 'rgba(109,40,217,0.42)';
      ctx.lineWidth = 1;
      const cx: number = w * 0.5;
      const cy: number = h * 0.42;
      const ring: number = Math.min(w, h) * 0.28 * ctaOrbit;
      ctx.beginPath();
      ctx.arc(cx, cy, ring, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }
}
