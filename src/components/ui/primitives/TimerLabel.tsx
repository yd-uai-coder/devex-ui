import { Paragraph } from "tamagui";

type Props = {
  children: React.ReactNode;
};

export function TimerLabel({ children }: Props) {
  return <Paragraph>{children}</Paragraph>;
}