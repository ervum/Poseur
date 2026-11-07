export interface TopographicContourPath {
  readonly PathData:       string;
  readonly IsIndexContour: boolean;
  readonly LevelIndex:     number;
};

export interface CadastralParcelShape {
  readonly PathData:       string;
  readonly Points:         readonly { readonly X: number; readonly Y: number }[];
  readonly IsMajorBlock:   boolean;
  readonly IsAccentParcel: boolean;
  readonly CentroidX:      number;
  readonly CentroidY:      number;
};

export interface SilkWavePath {
  readonly PathData:            string;
  readonly IsAccent:            boolean;
  readonly StrokeOpacityFactor: number;
  readonly BaseY:               number;
  readonly PhaseOffset:         number;
};

type QuadCornersType = [
  { X: number; Y: number },
  { X: number; Y: number },
  { X: number; Y: number },
  { X: number; Y: number }
];



export function CreateSeededRandom(Seed: number): (() => (number)) {
  let State: number = ((Seed >>> 0) || 0x6d2b79f5);

  return (): number => {
    State = ((State + 0x6d2b79f5) | 0);
    let Temporary: number = Math.imul((State ^ (State >>> 15)), (1 | State));
    Temporary = ((Temporary + Math.imul((Temporary ^ (Temporary >>> 7)), (61 | Temporary))) ^ Temporary);

    return (((Temporary ^ (Temporary >>> 14)) >>> 0) / 4294967296);
  };
}



export class SimplexNoiseField {
  private readonly Permutation: Uint8Array = new Uint8Array(512);

  private static readonly Gradient3D: readonly [number, number, number][] = [
    [1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0],
    [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1],
    [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1],
  ];

  constructor(Seed: number = 1337) {
    const Random: (() => (number)) = CreateSeededRandom(Seed);
    const Base: Uint8Array = new Uint8Array(256);

    for (let Index: number = 0; Index < 256; Index++) {
      Base[Index] = Index;
    }

    for (let Index: number = 255; Index > 0; Index--) {
      const SwapIndex: number = Math.floor(Random() * (Index + 1));
      const Hold: number = Base[Index];
      Base[Index] = Base[SwapIndex];
      Base[SwapIndex] = Hold;
    }

    for (let Index: number = 0; Index < 512; Index++) {
      this.Permutation[Index] = Base[Index & 255];
    }
  }

  public Sample2D(XInput: number, YInput: number): number {
    const F2: number = (0.5 * (Math.sqrt(3.0) - 1.0));
    const G2: number = ((3.0 - Math.sqrt(3.0)) / 6.0);

    const Skew: number = ((XInput + YInput) * F2);
    const I: number = Math.floor(XInput + Skew);
    const J: number = Math.floor(YInput + Skew);

    const Unskew: number = ((I + J) * G2);
    const X0: number = (XInput - (I - Unskew));
    const Y0: number = (YInput - (J - Unskew));

    const I1: number = (X0 > Y0) ? 1 : 0;
    const J1: number = (X0 > Y0) ? 0 : 1;

    const X1: number = ((X0 - I1) + G2);
    const Y1: number = ((Y0 - J1) + G2);
    const X2: number = ((X0 - 1.0) + (2.0 * G2));
    const Y2: number = ((Y0 - 1.0) + (2.0 * G2));

    const II: number = (I & 255);
    const JJ: number = (J & 255);

    const GradientIndex0: number = ((this.Permutation[II + this.Permutation[JJ]]) % 12);
    const GradientIndex1: number = ((this.Permutation[II + I1 + this.Permutation[JJ + J1]]) % 12);
    const GradientIndex2: number = ((this.Permutation[II + 1 + this.Permutation[JJ + 1]]) % 12);

    let N0: number = 0;
    let T0: number = (0.5 - (X0 * X0) - (Y0 * Y0));
    if (T0 >= 0) {
      T0 *= T0;
      const Gradient0: readonly [number, number, number] = SimplexNoiseField.Gradient3D[GradientIndex0];
      N0 = (T0 * T0 * ((Gradient0[0] * X0) + (Gradient0[1] * Y0)));
    }

    let N1: number = 0;
    let T1: number = (0.5 - (X1 * X1) - (Y1 * Y1));
    if (T1 >= 0) {
      T1 *= T1;
      const Gradient1: readonly [number, number, number] = SimplexNoiseField.Gradient3D[GradientIndex1];
      N1 = (T1 * T1 * ((Gradient1[0] * X1) + (Gradient1[1] * Y1)));
    }

    let N2: number = 0;
    let T2: number = (0.5 - (X2 * X2) - (Y2 * Y2));
    if (T2 >= 0) {
      T2 *= T2;
      const Gradient2: readonly [number, number, number] = SimplexNoiseField.Gradient3D[GradientIndex2];
      N2 = (T2 * T2 * ((Gradient2[0] * X2) + (Gradient2[1] * Y2)));
    }

    return (70.0 * (N0 + N1 + N2));
  }

  public SampleFBM(X: number, Y: number, TimeOffset: number = 0): number {
    const Primary: number = this.Sample2D((X + (TimeOffset * 0.35)), (Y + (TimeOffset * 0.22)));
    const Secondary: number = (0.5 * this.Sample2D(((X * 2.05) - (TimeOffset * 0.28)), ((Y * 2.05) + (TimeOffset * 0.31))));

    return ((Primary + Secondary) / 1.5);
  }
}



export function GenerateTopographicContours(
  Noise: SimplexNoiseField,
  ViewWidth: number,
  ViewHeight: number,
  DensityNormalized: number,
  TimeOffset: number = 0
): TopographicContourPath[] {
  const SafeDensity: number = Math.max(0, Math.min(1, DensityNormalized));
  const Columns: number = Math.round(34 + (SafeDensity * 28));
  const Rows: number = Math.max(20, Math.round(Columns * (ViewHeight / ViewWidth)));
  const LevelCount: number = Math.round(6 + (SafeDensity * 12));

  const CellWidth: number = (ViewWidth / Columns);
  const CellHeight: number = (ViewHeight / Rows);
  const Frequency: number = (2.1 + (SafeDensity * 1.3));

  const Grid: Float32Array = new Float32Array((Columns + 1) * (Rows + 1));
  const Stride: number = (Columns + 1);

  for (let Row: number = 0; Row <= Rows; Row++) {
    const NormalizedY: number = ((Row / Rows) * Frequency * (ViewHeight / ViewWidth));

    for (let Column: number = 0; Column <= Columns; Column++) {
      const NormalizedX: number = ((Column / Columns) * Frequency);
      Grid[(Row * Stride) + Column] = Noise.SampleFBM(NormalizedX, NormalizedY, TimeOffset);
    }
  }

  const Contours: TopographicContourPath[] = [];

  const Interpolate: ((V1: number, V2: number, Iso: number) => (number)) = (
    V1: number,
    V2: number,
    Iso: number
  ): number => {
    const Denominator: number = (V2 - V1);
    if (Math.abs(Denominator) < 1e-5) return 0.5;

    return Math.max(0, Math.min(1, ((Iso - V1) / Denominator)));
  };

  for (let LevelIndex: number = 0; LevelIndex < LevelCount; LevelIndex++) {
    const IsoValue: number = (-0.78 + ((LevelIndex / Math.max(1, (LevelCount - 1))) * 1.56));
    const Segments: string[] = [];

    for (let Row: number = 0; Row < Rows; Row++) {
      const YTop: number = (Row * CellHeight);
      const YBottom: number = ((Row + 1) * CellHeight);

      for (let Column: number = 0; Column < Columns; Column++) {
        const XLeft: number = (Column * CellWidth);
        const XRight: number = ((Column + 1) * CellWidth);

        const ValueTopLeft: number = Grid[(Row * Stride) + Column];
        const ValueTopRight: number = Grid[(Row * Stride) + Column + 1];
        const ValueBottomRight: number = Grid[((Row + 1) * Stride) + Column + 1];
        const ValueBottomLeft: number = Grid[((Row + 1) * Stride) + Column];

        let Mask: number = 0;
        if (ValueTopLeft >= IsoValue) Mask |= 8;
        if (ValueTopRight >= IsoValue) Mask |= 4;
        if (ValueBottomRight >= IsoValue) Mask |= 2;
        if (ValueBottomLeft >= IsoValue) Mask |= 1;

        if ((Mask === 0) || (Mask === 15)) continue;

        const TopX: number = (XLeft + (Interpolate(ValueTopLeft, ValueTopRight, IsoValue) * CellWidth));
        const TopY: number = YTop;
        const RightX: number = XRight;
        const RightY: number = (YTop + (Interpolate(ValueTopRight, ValueBottomRight, IsoValue) * CellHeight));
        const BottomX: number = (XLeft + (Interpolate(ValueBottomLeft, ValueBottomRight, IsoValue) * CellWidth));
        const BottomY: number = YBottom;
        const LeftX: number = XLeft;
        const LeftY: number = (YTop + (Interpolate(ValueTopLeft, ValueBottomLeft, IsoValue) * CellHeight));

        const AddSegment: ((X1: number, Y1: number, X2: number, Y2: number) => (void)) = (
          X1: number,
          Y1: number,
          X2: number,
          Y2: number
        ): void => {
          Segments.push(`M${X1.toFixed(1)},${Y1.toFixed(1)}L${X2.toFixed(1)},${Y2.toFixed(1)}`);
        };

        switch (Mask) {
          case 1:
          case 14:
            AddSegment(LeftX, LeftY, BottomX, BottomY);
            break;
          case 2:
          case 13:
            AddSegment(BottomX, BottomY, RightX, RightY);
            break;
          case 3:
          case 12:
            AddSegment(LeftX, LeftY, RightX, RightY);
            break;
          case 4:
          case 11:
            AddSegment(TopX, TopY, RightX, RightY);
            break;
          case 5:
            AddSegment(LeftX, LeftY, TopX, TopY);
            AddSegment(BottomX, BottomY, RightX, RightY);
            break;
          case 6:
          case 9:
            AddSegment(TopX, TopY, BottomX, BottomY);
            break;
          case 7:
          case 8:
            AddSegment(LeftX, LeftY, TopX, TopY);
            break;
          case 10:
            AddSegment(LeftX, LeftY, BottomX, BottomY);
            AddSegment(TopX, TopY, RightX, RightY);
            break;
        }
      }
    }

    if ((Segments.length) > 0) {
      Contours.push({
        PathData:       Segments.join(''),
        IsIndexContour: ((LevelIndex % 4) === 0),
        LevelIndex,
      });
    }
  }

  return Contours;
}

function LerpPoint(
  PointA: { X: number; Y: number },
  PointB: { X: number; Y: number },
  Factor: number
): { X: number; Y: number } {
  return {
    X: (PointA.X + ((PointB.X - PointA.X) * Factor)),
    Y: (PointA.Y + ((PointB.Y - PointA.Y) * Factor)),
  };
}

function InsetQuad(Corners: QuadCornersType, InsetAmount: number): QuadCornersType {
  const CenterX: number = ((Corners[0].X + Corners[1].X + Corners[2].X + Corners[3].X) * 0.25);
  const CenterY: number = ((Corners[0].Y + Corners[1].Y + Corners[2].Y + Corners[3].Y) * 0.25);

  return Corners.map((Point: { X: number; Y: number }): { X: number; Y: number } => {
    const DeltaX: number = (Point.X - CenterX);
    const DeltaY: number = (Point.Y - CenterY);
    const Distance: number = (Math.hypot(DeltaX, DeltaY) || 1);
    const Scale: number = Math.max(0.25, ((Distance - InsetAmount) / Distance));

    return {
      X: (CenterX + (DeltaX * Scale)),
      Y: (CenterY + (DeltaY * Scale)),
    };
  }) as QuadCornersType;
}

export function GenerateCadastralParcels(
  ViewWidth: number,
  ViewHeight: number,
  DensityNormalized: number,
  Seed: number = 2026
): CadastralParcelShape[] {
  const Random: (() => (number)) = CreateSeededRandom(Seed);
  const SafeDensity: number = Math.max(0, Math.min(1, DensityNormalized));
  const MaximumDepth: number = Math.round(3 + (SafeDensity * 2.5));

  const Parcels: CadastralParcelShape[] = [];

  const Subdivide: ((Quad: QuadCornersType, Depth: number, SplitHorizontal: boolean) => (void)) = (
    Quad: QuadCornersType,
    Depth: number,
    SplitHorizontal: boolean
  ): void => {
    const WidthApproximation: number = Math.hypot((Quad[1].X - Quad[0].X), (Quad[1].Y - Quad[0].Y));
    const HeightApproximation: number = Math.hypot((Quad[3].X - Quad[0].X), (Quad[3].Y - Quad[0].Y));
    const MinimumSize: number = (120 - (SafeDensity * 55));

    if ((Depth >= MaximumDepth) || ((WidthApproximation < MinimumSize) && (HeightApproximation < MinimumSize))) {
      const InsetGap: number = (Depth <= 2) ? 7.5 : 3.2;
      const FinalQuad: QuadCornersType = InsetQuad(Quad, InsetGap);
      const PathData: string =
        `M${FinalQuad[0].X.toFixed(1)},${FinalQuad[0].Y.toFixed(1)}` +
        `L${FinalQuad[1].X.toFixed(1)},${FinalQuad[1].Y.toFixed(1)}` +
        `L${FinalQuad[2].X.toFixed(1)},${FinalQuad[2].Y.toFixed(1)}` +
        `L${FinalQuad[3].X.toFixed(1)},${FinalQuad[3].Y.toFixed(1)}Z`;

      const CentroidX: number = ((FinalQuad[0].X + FinalQuad[1].X + FinalQuad[2].X + FinalQuad[3].X) * 0.25);
      const CentroidY: number = ((FinalQuad[0].Y + FinalQuad[1].Y + FinalQuad[2].Y + FinalQuad[3].Y) * 0.25);

      Parcels.push({
        PathData,
        Points:         FinalQuad,
        IsMajorBlock:   (Depth <= 2),
        IsAccentParcel: (Random() < 0.16),
        CentroidX,
        CentroidY,
      });

      return;
    }

    if (Depth === 1) {
      const AvenueQuad: QuadCornersType = InsetQuad(Quad, 5.5);
      const AvenuePath: string =
        `M${AvenueQuad[0].X.toFixed(1)},${AvenueQuad[0].Y.toFixed(1)}` +
        `L${AvenueQuad[1].X.toFixed(1)},${AvenueQuad[1].Y.toFixed(1)}` +
        `L${AvenueQuad[2].X.toFixed(1)},${AvenueQuad[2].Y.toFixed(1)}` +
        `L${AvenueQuad[3].X.toFixed(1)},${AvenueQuad[3].Y.toFixed(1)}Z`;

      Parcels.push({
        PathData:       AvenuePath,
        Points:         AvenueQuad,
        IsMajorBlock:   true,
        IsAccentParcel: false,
        CentroidX:      ((AvenueQuad[0].X + AvenueQuad[2].X) * 0.5),
        CentroidY:      ((AvenueQuad[0].Y + AvenueQuad[2].Y) * 0.5),
      });
    }

    const RatioA: number = (0.34 + (Random() * 0.32));
    const RatioB: number = (RatioA + ((Random() - 0.5) * 0.08));
    const ClampedB: number = Math.max(0.28, Math.min(0.72, RatioB));

    if (SplitHorizontal) {
      const LeftMidpoint: { X: number; Y: number } = LerpPoint(Quad[0], Quad[3], RatioA);
      const RightMidpoint: { X: number; Y: number } = LerpPoint(Quad[1], Quad[2], ClampedB);
      Subdivide([Quad[0], Quad[1], RightMidpoint, LeftMidpoint], (Depth + 1), false);
      Subdivide([LeftMidpoint, RightMidpoint, Quad[2], Quad[3]], (Depth + 1), false);
    } else {
      const TopMidpoint: { X: number; Y: number } = LerpPoint(Quad[0], Quad[1], RatioA);
      const BottomMidpoint: { X: number; Y: number } = LerpPoint(Quad[3], Quad[2], ClampedB);
      Subdivide([Quad[0], TopMidpoint, BottomMidpoint, Quad[3]], (Depth + 1), true);
      Subdivide([TopMidpoint, Quad[1], Quad[2], BottomMidpoint], (Depth + 1), true);
    }
  };

  const Margin: number = 60;
  const RootQuad: QuadCornersType = [
    { X: -Margin,                 Y: (-Margin * 0.5) },
    { X: (ViewWidth + Margin),    Y: -Margin },
    { X: (ViewWidth + (Margin * 0.6)), Y: (ViewHeight + Margin) },
    { X: (-Margin * 0.7),         Y: (ViewHeight + (Margin * 0.6)) },
  ];

  Subdivide(RootQuad, 0, false);

  return Parcels;
}

export function GenerateSilkWavePaths(
  Noise: SimplexNoiseField,
  ViewWidth: number,
  ViewHeight: number,
  DensityNormalized: number,
  TimeOffset: number = 0
): SilkWavePath[] {
  const SafeDensity: number = Math.max(0, Math.min(1, DensityNormalized));
  const LineCount: number = Math.round(12 + (SafeDensity * 26));
  const SegmentCount: number = 32;

  const Paths: SilkWavePath[] = [];

  for (let LineIndex: number = 0; LineIndex < LineCount; LineIndex++) {
    const Progress: number = (LineIndex / Math.max(1, (LineCount - 1)));
    const BaseY: number = ((ViewHeight * 0.08) + (Progress * ViewHeight * 0.84));
    const Commands: string[] = [];

    for (let SegmentIndex: number = 0; SegmentIndex <= SegmentCount; SegmentIndex++) {
      const NormalizedX: number = (SegmentIndex / SegmentCount);
      const X: number = (NormalizedX * ViewWidth);
      const WaveField: number = Noise.Sample2D(
        ((NormalizedX * 2.4) + (TimeOffset * 0.25)),
        ((Progress * 1.9) + (TimeOffset * 0.18))
      );
      const Harmonic: number = (Math.sin((NormalizedX * Math.PI * 2.5) + (Progress * 3.8) + TimeOffset) * 28);
      const Y: number = (BaseY + (WaveField * 62) + Harmonic);

      Commands.push(`${(SegmentIndex === 0) ? 'M' : 'L'}${X.toFixed(1)},${Y.toFixed(1)}`);
    }

    const CenterDistance: number = (Math.abs(Progress - 0.5) * 2);
    const EnvelopeOpacity: number = Math.max(0.25, (1 - (CenterDistance * 0.62)));

    Paths.push({
      PathData:            Commands.join(''),
      IsAccent:            ((LineIndex % 5) === 0),
      StrokeOpacityFactor: EnvelopeOpacity,
      BaseY,
      PhaseOffset:         (Progress * Math.PI * 2),
    });
  }

  return Paths;
}
