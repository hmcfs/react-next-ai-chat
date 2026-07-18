import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MODEL_LIST } from '@/constants/index';
import { Model, useQuestionStore } from '@/lib/store';
type Props = {
  className?: string;
  changeModel: (model: Model) => void;
  parentModel: Model;
};
export default function ModelCheck({ className = '', changeModel, parentModel }: Props) {
  const setModel = useQuestionStore((state) => state.setModel);

  return (
    <div className={className}>
      <Select
        value={parentModel || MODEL_LIST[0].value}
        onValueChange={(value) => {
          setModel(value as Model);
          changeModel(value as Model);
        }}
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
