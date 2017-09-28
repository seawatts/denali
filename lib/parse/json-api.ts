import {
  isArray,
  mapKeys,
  camelCase
} from 'lodash';
import * as assert from 'assert';
import JSONParser from './json';
import Errors from '../runtime/errors';
import { ResponderParams } from '../runtime/action';
import Request from '../runtime/request';
import setIfNotEmpty from '../utils/set-if-not-empty';
import { singularize } from 'inflection';
import {
  JsonApiResourceObject,
  JsonApiAttributes,
  JsonApiRelationships
} from '../render/json-api';

export default class JSONAPIParser extends JSONParser {

  type = 'application/vnd.api+json';

  async parse(request: Request) {
    let body = await this.bufferAndParseBody(request);

    let result: ResponderParams = {
      query: request.query,
      headers: request.headers,
      params: request.params
    };

    if (!request.hasBody) {
      return result;
    }

    try {
      assert(request.getHeader('content-type') === 'application/vnd.api+json', 'Invalid content type - must have `application/vnd.api+json` as the request content type');
      assert(body.data, 'Invalid JSON-API document (missing top level `data` object - see http://jsonapi.org/format/#document-top-level)');

      let parseResource = this.parseResource.bind(this);

      if (body.data) {
        if (!isArray(body.data)) {
          result.body = parseResource(body.data);
        } else {
          result.body = body.data.map(parseResource);
        }
      }

      if (body.included) {
        result.included = body.included.map(parseResource);
      }

      return result;
    } catch (e) {
      if (e.name === 'AssertionError') {
        throw new Errors.BadRequest(e.message);
      }
      throw e;
    }
  }


  /**
   * Parse a single resource object from a JSONAPI document. The resource object could come from the
   * top level `data` payload, or from the sideloaded `included` records.
   */
  protected parseResource(resource: JsonApiResourceObject): any {
    let parsedResource = {};
    setIfNotEmpty(parsedResource, 'id', this.parseId(resource.id));
    Object.assign(parsedResource, this.parseAttributes(resource.attributes));
    Object.assign(parsedResource, this.parseRelationships(resource.relationships));
    return parsedResource;
  }

  /**
   * Parse a resource object id
   */
  protected parseId(id: string): any {
    return id;
  }

  /**
   * Parse a resource object's type string
   */
  protected parseType(type: string): string {
    return singularize(type);
  }

  /**
   * Parse a resource object's attributes. By default, this converts from the JSONAPI recommended
   * dasheried keys to camelCase.
   */
  protected parseAttributes(attrs: JsonApiAttributes): any {
    return mapKeys(attrs, (value, key) => {
      return camelCase(key);
    });
  }

  /**
   * Parse a resource object's relationships. By default, this converts from the JSONAPI recommended
   * dasheried keys to camelCase.
   */
  protected parseRelationships(relationships: JsonApiRelationships): any {
    return mapKeys(relationships, (value, key) => {
      return camelCase(key);
    });
  }

}
