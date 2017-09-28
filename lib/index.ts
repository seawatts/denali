import 'main-dir';

/**
 *
 * This is the main module exported by Denali when it is loaded via
 * `require/import`.
 *
 * This exports convenient shortcuts to other modules within Denali.
 * Rather than having to `import Addon from 'denali/lib/runtime/addon'`,
 * you can just `import { Addon } from 'denali'`.
 *
 */

// Data
import {
  attr,
  hasMany,
  hasOne,
  RelationshipDescriptor,
  HasOneRelationshipDescriptor,
  HasManyRelationshipDescriptor,
  AttributeDescriptor
} from './data/descriptors';
import Model from './data/model';
import ORMAdapter from './data/orm-adapter';
import MemoryAdapter from './data/memory';
import DatabaseService from './data/database';

// Render
import Serializer from './render/serializer';
import JSONSerializer from './render/json';
import JSONAPISerializer from './render/json-api';
import View from './render/view';

// Parse
import Parser from './parse/parser';
import JSONParser from './parse/json';
import JSONAPIParser from './parse/json-api';

// Metal
import Instrumentation from './metal/instrumentation';
import mixin, {
  createMixin,
  MixinFactory,
  MixinApplicator
} from './metal/mixin';
import eachPrototype from './metal/each-prototype';
import Container from './metal/container';
import Resolver from './metal/resolver';
import inject from './metal/inject';

// Runtime
import Action, {
  RenderOptions,
  ResponderParams
} from './runtime/action';
import Addon from './runtime/addon';
import Application from './runtime/application';
import Errors from './runtime/errors';
import Logger from './runtime/logger';
import Request from './runtime/request';
import Router from './runtime/router';
import Service from './runtime/service';
import ConfigService from './runtime/config';

// Test
import appAcceptanceTest, { AppAcceptance } from './test/app-acceptance';
import MockRequest from './test/mock-request';
import MockResponse from './test/mock-response';

export {
  // Data
  attr,
  hasMany,
  hasOne,
  RelationshipDescriptor,
  HasOneRelationshipDescriptor,
  HasManyRelationshipDescriptor,
  AttributeDescriptor,
  Model,
  ORMAdapter,
  MemoryAdapter,
  DatabaseService,

  // Render
  View,
  Serializer,
  JSONSerializer,
  JSONAPISerializer,

  // Parse
  Parser,
  JSONParser,
  JSONAPIParser,

  // Metal
  Instrumentation,
  mixin,
  createMixin,
  MixinFactory,
  MixinApplicator,
  eachPrototype,
  Container,
  Resolver,
  inject,

  // Runtime
  Action,
  Addon,
  Application,
  Errors,
  Logger,
  Request,
  Router,
  Service,
  RenderOptions,
  ResponderParams,
  ConfigService,

  // Test
  AppAcceptance,
  appAcceptanceTest,
  MockRequest,
  MockResponse
};
