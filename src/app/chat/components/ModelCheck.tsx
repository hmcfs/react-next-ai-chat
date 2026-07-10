import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MODEL_LIST } from '@/constants/index';
type Props = {
  className?: string;
  changeModel: (model: string) => void;
  parentModel: string;
};
export default function ModelCheck({ className = '', changeModel, parentModel }: Props) {
  return (
    <div className={className}>
      <Select
        value={parentModel || MODEL_LIST[0].label}
        onValueChange={(value) => changeModel(value)}
      >
        <SelectTrigger className="w-full max-w-48">
          <SelectValue className="w-[180px]" placeholder="选择模型" />
        </SelectTrigger>
        <SelectContent>
          {MODEL_LIST.map((item) => (
            <SelectItem key={item.label} value={item.label}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
