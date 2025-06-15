import { Model } from "objection";

export class BaseModel extends Model {
  static override get useLimitInFirst() {
    return true;
  }
}
