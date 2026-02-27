interface Props {
  value: string;
}

export default function TextSegment({ value }: Props) {
  return <span>{value}</span>;
}
