import { MODEL_LIST } from '@/constants';
import { Model } from '@/lib/store';

export const isValidModel = (model: Model) => {
  return MODEL_LIST.some((item) => item.value === model);
};
//校正模型
export const normalizeModel = (model: Model): Model => {
  const hasModel = MODEL_LIST.find((item) => item.value === model)?.value || MODEL_LIST[0].value;
  if (!hasModel) {
    localStorage.setItem('model', MODEL_LIST[0].value);
    return MODEL_LIST[0].value as Model;
  }
  return model;
};
