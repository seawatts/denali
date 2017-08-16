import Serializer, { RelationshipConfig } from './serializer';
import Model from '../data/model';
import Action, { RenderOptions } from '../runtime/action';
import { RelationshipDescriptor } from '../data/descriptors';
/**
 * Renders the payload as a flat JSON object or array at the top level. Related
 * models are embedded.
 *
 * @package data
 */
export default abstract class FlatSerializer extends Serializer {
    /**
     * The default content type to apply to responses formatted by this serializer
     */
    contentType: string;
    /**
     * Renders the payload, either a primary data model(s) or an error payload.
     */
    serialize(body: any, action: Action, options?: RenderOptions): Promise<any>;
    /**
     * Renders a primary data payload (a model or array of models).
     */
    protected renderPrimary(payload: Model | Model[], action: Action, options: RenderOptions): Promise<any>;
    /**
     * Renders an individual model
     */
    renderModel(model: Model, action: Action, options: RenderOptions): Promise<any>;
    /**
     * Serialize the attributes for a given model
     */
    protected serializeAttributes(model: Model, action: Action, options: RenderOptions): any;
    /**
     * Transform attribute names into their over-the-wire representation. Default
     * behavior uses the attribute name as-is.
     */
    protected serializeAttributeName(attributeName: string): string;
    /**
     * Take an attribute value and return the serialized value. Useful for
     * changing how certain types of values are serialized, i.e. Date objects.
     *
     * The default implementation returns the attribute's value unchanged.
     */
    protected serializeAttributeValue(value: any, key: string, model: any): any;
    /**
     * Serialize the relationships for a given model
     */
    protected serializeRelationships(model: any, action: Action, options: RenderOptions): Promise<{
        [key: string]: any;
    }>;
    /**
     * Serializes a relationship
     */
    protected serializeRelationship(relationship: string, config: RelationshipConfig, descriptor: RelationshipDescriptor, model: Model, action: Action, options: RenderOptions): Promise<any>;
    /**
     * Transform relationship names into their over-the-wire representation. Default
     * behavior uses the relationship name as-is.
     *
     * @protected
     * @param {string} name
     * @returns {string}
     */
    protected serializeRelationshipName(name: string): string;
    /**
     * Render an error payload
     */
    protected renderError(error: any, action: Action, options: any): any;
}
