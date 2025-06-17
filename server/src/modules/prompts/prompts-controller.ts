import { Context } from '../../config/context';
import { Controller } from '../../utils/controller';
import { AVAILABLE_PROMPTS } from '../../types/Prompts';

const getAllPrompts = async (context: Context, data: any) => {
  return AVAILABLE_PROMPTS;
};

export const PromptsController = Controller.register({
  name: 'prompts',
  controllers: {
    getAllPrompts: {
      fn: getAllPrompts,
      config: {},
    },
  },
});