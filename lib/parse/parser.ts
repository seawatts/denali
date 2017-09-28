import DenaliObject from '../metal/object';
import Request from '../runtime/request';
import { ResponderParams } from '../runtime/action';

export default abstract class Parser extends DenaliObject {

  abstract async parse(request: Request): Promise<ResponderParams>;

}
