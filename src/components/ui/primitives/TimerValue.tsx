import { Paragraph } from "tamagui";

type Props = {
  seconds: number;
  active: boolean;
  timer_id?: string;
};

function formatSeconds(totalSeconds: number) {
  const hour = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  if(totalSeconds>=360){
    return `${hour}時間:${minutes}分:${seconds}秒`;
  }else if(totalSeconds>=60){
    return `${minutes}分 ${seconds}秒`;
  }else{
    return `${seconds}秒`;
  }
}

export function TimerValue({
  seconds,
  active,
  timer_id,
}: Props) {
  return (
    <Paragraph
      id={timer_id}
      fontSize="$10"
      lineHeight={32}
      color={active ? undefined : "$gray9"}
    >
      {formatSeconds(seconds)}
    </Paragraph>
  );
}