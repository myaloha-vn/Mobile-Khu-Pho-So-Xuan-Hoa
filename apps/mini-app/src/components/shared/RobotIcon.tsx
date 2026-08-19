import robotAssistant from "../../assets/robot-assistant-v2.gif";

export function RobotIcon({ size = 40, className = "" }: { size?: number; className?: string }) {
  return (
    <img src={robotAssistant} alt="Trợ lý ảo"
      className={`object-contain ${className}`} style={{ width: size, height: size }} />
  );
}
