"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
/* tslint:disable:completed-docs no-empty no-invalid-this member-access */
const ava_1 = require("ava");
const lodash_1 = require("lodash");
const denali_1 = require("denali");
ava_1.default.beforeEach((t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let container = t.context.container = new denali_1.Container(__dirname);
    container.register('service:db', denali_1.DatabaseService);
    container.register('action:posts/show', denali_1.Action);
    container.register('action:comments/show', denali_1.Action);
    container.register('app:router', class extends denali_1.Router {
    });
    let router = container.lookup('app:router');
    router.map((router) => {
        router.get('/posts', 'posts/show');
    });
    container.register('orm-adapter:application', class extends denali_1.MemoryAdapter {
    });
}));
ava_1.default('renders models as JSON-API resource objects', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let container = t.context.container;
    container.register('serializer:post', class TestSerializer extends denali_1.JSONAPISerializer {
        constructor() {
            super(...arguments);
            this.attributes = ['title'];
            this.relationships = {};
        }
    });
    container.register('model:post', (_a = class Post extends denali_1.Model {
        },
        _a.title = denali_1.attr('string'),
        _a));
    let Post = container.factoryFor('model:post');
    let serializer = container.lookup('serializer:post');
    let payload = yield Post.create({ title: 'foo' }).save();
    let result = yield serializer.serialize(payload, {}, {});
    t.is(result.data.attributes.title, 'foo');
    var _a;
}));
ava_1.default('renders errors according to spec', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let container = t.context.container;
    container.register('serializer:application', class TestSerializer extends denali_1.JSONAPISerializer {
        constructor() {
            super(...arguments);
            this.attributes = [];
            this.relationships = {};
        }
    });
    let serializer = container.lookup('serializer:application');
    let result = yield serializer.serialize(new denali_1.Errors.InternalServerError('foo'), {}, {});
    t.is(result.errors[0].status, 500);
    t.is(result.errors[0].code, 'InternalServerError');
    t.is(result.errors[0].detail, 'foo');
}));
ava_1.default('renders validation errors with additional details', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let container = t.context.container;
    container.register('serializer:application', class TestSerializer extends denali_1.JSONAPISerializer {
        constructor() {
            super(...arguments);
            this.attributes = [];
            this.relationships = {};
        }
    });
    let serializer = container.lookup('serializer:application');
    let error = new denali_1.Errors.UnprocessableEntity('Email cannot be blank');
    error.title = 'presence';
    error.source = '/data/attributes/email';
    let result = yield serializer.serialize(error, {}, {});
    t.is(result.errors[0].status, 422);
    t.is(result.errors[0].code, 'UnprocessableEntityError');
    t.is(result.errors[0].title, 'presence');
    t.is(result.errors[0].source, '/data/attributes/email');
    t.is(result.errors[0].detail, 'Email cannot be blank');
}));
ava_1.default('sideloads related records', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let container = t.context.container;
    container.register('serializer:post', class PostSerializer extends denali_1.JSONAPISerializer {
        constructor() {
            super(...arguments);
            this.attributes = ['title'];
            this.relationships = {
                comments: {
                    strategy: 'embed'
                }
            };
        }
    });
    container.register('serializer:comment', class CommentSerializer extends denali_1.JSONAPISerializer {
        constructor() {
            super(...arguments);
            this.attributes = ['text'];
            this.relationships = {};
        }
    });
    container.register('model:post', (_a = class Post extends denali_1.Model {
        },
        _a.title = denali_1.attr('string'),
        _a.comments = denali_1.hasMany('comment'),
        _a));
    container.register('model:comment', (_b = class Comment extends denali_1.Model {
        },
        _b.text = denali_1.attr('string'),
        _b));
    let db = container.lookup('service:db');
    let serializer = container.lookup('serializer:post');
    let post = yield db.create('post', { title: 'foo' }).save();
    let comment = yield db.create('comment', { text: 'bar' }).save();
    yield post.addComment(comment);
    let result = yield serializer.serialize(post, {}, {});
    t.true(lodash_1.isArray(result.included));
    t.is(result.included[0].attributes.text, 'bar');
    var _a, _b;
}));
ava_1.default.todo('dedupes sideloaded related records');
ava_1.default('embeds related records as resource linkage objects', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let container = t.context.container;
    container.register('serializer:post', class PostSerializer extends denali_1.JSONAPISerializer {
        constructor() {
            super(...arguments);
            this.attributes = ['title'];
            this.relationships = {
                comments: {
                    strategy: 'id'
                }
            };
        }
    });
    container.register('serializer:comment', class CommentSerializer extends denali_1.JSONAPISerializer {
        constructor() {
            super(...arguments);
            this.attributes = ['text'];
            this.relationships = {};
        }
    });
    container.register('model:post', (_a = class Post extends denali_1.Model {
        },
        _a.title = denali_1.attr('string'),
        _a.comments = denali_1.hasMany('comment'),
        _a));
    container.register('model:comment', (_b = class Comment extends denali_1.Model {
        },
        _b.text = denali_1.attr('string'),
        _b));
    let Post = container.factoryFor('model:post');
    let Comment = container.factoryFor('model:comment');
    let serializer = container.lookup('serializer:post');
    let post = yield Post.create({ title: 'foo' }).save();
    let comment = yield Comment.create({ text: 'bar' }).save();
    yield post.addComment(comment);
    let result = yield serializer.serialize(post, {}, {});
    t.true(lodash_1.isArray(result.included));
    t.is(result.included[0].id, comment.id);
    t.is(result.included[0].type, 'comments');
    var _a, _b;
}));
ava_1.default('renders document meta', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let container = t.context.container;
    container.register('serializer:post', class TestSerializer extends denali_1.JSONAPISerializer {
        constructor() {
            super(...arguments);
            this.attributes = [];
            this.relationships = {};
        }
    });
    container.register('model:post', class Post extends denali_1.Model {
    });
    let Post = container.factoryFor('model:post');
    let serializer = container.lookup('serializer:post');
    let payload = yield Post.create({}).save();
    let result = yield serializer.serialize(payload, {}, { meta: { foo: true } });
    t.true(result.meta.foo);
}));
ava_1.default('renders document links', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let container = t.context.container;
    container.register('serializer:post', class TestSerializer extends denali_1.JSONAPISerializer {
        constructor() {
            super(...arguments);
            this.attributes = [];
            this.relationships = {};
        }
    });
    container.register('model:post', class Post extends denali_1.Model {
    });
    let Post = container.factoryFor('model:post');
    let serializer = container.lookup('serializer:post');
    let payload = yield Post.create({}).save();
    let result = yield serializer.serialize(payload, {}, { links: { foo: true } });
    t.true(result.links.foo);
}));
ava_1.default('renders jsonapi version', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let container = t.context.container;
    container.register('serializer:post', class TestSerializer extends denali_1.JSONAPISerializer {
        constructor() {
            super(...arguments);
            this.attributes = [];
            this.relationships = {};
        }
    });
    container.register('model:post', class Post extends denali_1.Model {
    });
    let Post = container.factoryFor('model:post');
    let serializer = container.lookup('serializer:post');
    let payload = yield Post.create({}).save();
    let result = yield serializer.serialize(payload, {}, {});
    t.is(result.jsonapi.version, '1.0');
}));
ava_1.default('renders an array of models as an array under `data`', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let container = t.context.container;
    container.register('serializer:post', class TestSerializer extends denali_1.JSONAPISerializer {
        constructor() {
            super(...arguments);
            this.attributes = ['title'];
            this.relationships = {};
        }
    });
    container.register('model:post', (_a = class Post extends denali_1.Model {
        },
        _a.title = denali_1.attr('string'),
        _a));
    let Post = container.factoryFor('model:post');
    let serializer = container.lookup('serializer:post');
    let postOne = yield Post.create({ title: 'foo' }).save();
    let postTwo = yield Post.create({ title: 'bar' }).save();
    let result = yield serializer.serialize([postOne, postTwo], {}, {});
    t.true(lodash_1.isArray(result.data));
    t.is(result.data[0].id, postOne.id);
    t.is(result.data[1].id, postTwo.id);
    var _a;
}));
ava_1.default('only renders whitelisted attributes', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let container = t.context.container;
    container.register('serializer:post', class PostSerializer extends denali_1.JSONAPISerializer {
        constructor() {
            super(...arguments);
            this.attributes = ['title'];
            this.relationships = {};
        }
    });
    container.register('model:post', (_a = class Post extends denali_1.Model {
        },
        _a.title = denali_1.attr('string'),
        _a.content = denali_1.attr('string'),
        _a));
    let Post = container.factoryFor('model:post');
    let serializer = container.lookup('serializer:post');
    let post = yield Post.create({ title: 'foo', content: 'bar' }).save();
    let result = yield serializer.serialize(post, {}, {});
    t.is(result.data.attributes.title, 'foo');
    t.falsy(result.data.attributes.content);
    var _a;
}));
ava_1.default('allows render options to override class-level attributes whitelist', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let container = t.context.container;
    container.register('serializer:post', class PostSerializer extends denali_1.JSONAPISerializer {
        constructor() {
            super(...arguments);
            this.attributes = ['title'];
            this.relationships = {};
        }
    });
    container.register('model:post', (_a = class Post extends denali_1.Model {
        },
        _a.title = denali_1.attr('string'),
        _a.content = denali_1.attr('string'),
        _a));
    let Post = container.factoryFor('model:post');
    let serializer = container.lookup('serializer:post');
    let post = yield Post.create({ title: 'foo', content: 'bar' }).save();
    let result = yield serializer.serialize(post, {}, { attributes: ['content'] });
    t.is(result.data.attributes.content, 'bar');
    t.falsy(result.data.attributes.title);
    var _a;
}));
ava_1.default('only renders whitelisted relationships', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let container = t.context.container;
    container.register('serializer:post', class PostSerializer extends denali_1.JSONAPISerializer {
        constructor() {
            super(...arguments);
            this.attributes = ['title'];
            this.relationships = {
                comments: {
                    strategy: 'id'
                }
            };
        }
    });
    container.register('serializer:comment', class CommentSerializer extends denali_1.JSONAPISerializer {
        constructor() {
            super(...arguments);
            this.attributes = ['text'];
            this.relationships = {};
        }
    });
    container.register('model:post', (_a = class Post extends denali_1.Model {
        },
        _a.title = denali_1.attr('string'),
        _a.author = denali_1.hasOne('user'),
        _a.comments = denali_1.hasMany('comment'),
        _a));
    container.register('model:comment', (_b = class Comment extends denali_1.Model {
        },
        _b.text = denali_1.attr('string'),
        _b));
    container.register('model:user', class Comment extends denali_1.Model {
    });
    let Post = container.factoryFor('model:post');
    let serializer = container.lookup('serializer:post');
    let post = yield Post.create({ title: 'foo' }).save();
    let result = yield serializer.serialize(post, {}, {});
    t.true(lodash_1.isArray(result.data.relationships.comments.data));
    t.falsy(result.data.relationships.author);
    var _a, _b;
}));
ava_1.default('allows render options to override class-level relationships whitelist', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let container = t.context.container;
    container.register('serializer:post', class PostSerializer extends denali_1.JSONAPISerializer {
        constructor() {
            super(...arguments);
            this.attributes = ['title'];
            this.relationships = {
                author: {
                    strategy: 'id'
                }
            };
        }
    });
    container.register('serializer:comments', class CommentSerializer extends denali_1.JSONAPISerializer {
        constructor() {
            super(...arguments);
            this.attributes = ['title'];
            this.relationships = {};
        }
    });
    container.register('model:post', (_a = class Post extends denali_1.Model {
        },
        _a.title = denali_1.attr('string'),
        _a.author = denali_1.hasOne('user'),
        _a.comments = denali_1.hasMany('comment'),
        _a));
    container.register('model:comment', (_b = class Comment extends denali_1.Model {
        },
        _b.text = denali_1.attr('string'),
        _b));
    container.register('model:user', class Comment extends denali_1.Model {
    });
    let Post = container.factoryFor('model:post');
    let serializer = container.lookup('serializer:post');
    let post = yield Post.create({ title: 'foo' }).save();
    let result = yield serializer.serialize(post, {}, {
        relationships: {
            comments: {
                strategy: 'id'
            }
        }
    });
    t.true(lodash_1.isArray(result.data.relationships.comments.data));
    t.falsy(result.data.relationships.author);
    var _a, _b;
}));
ava_1.default('uses related serializers to render related records', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let container = t.context.container;
    container.register('serializer:post', class PostSerializer extends denali_1.JSONAPISerializer {
        constructor() {
            super(...arguments);
            this.attributes = ['title'];
            this.relationships = {
                comments: {
                    strategy: 'embed'
                }
            };
        }
    });
    container.register('serializer:comment', class CommentSerializer extends denali_1.JSONAPISerializer {
        constructor() {
            super(...arguments);
            this.attributes = ['text'];
            this.relationships = {};
        }
    });
    container.register('model:post', (_a = class Post extends denali_1.Model {
        },
        _a.title = denali_1.attr('string'),
        _a.comments = denali_1.hasMany('comment'),
        _a));
    container.register('model:comment', (_b = class Comment extends denali_1.Model {
        },
        _b.text = denali_1.attr('string'),
        _b.publishedAt = denali_1.attr('string'),
        _b));
    let Post = container.factoryFor('model:post');
    let Comment = container.factoryFor('model:comment');
    let serializer = container.lookup('serializer:post');
    let post = yield Post.create({ title: 'foo' }).save();
    yield post.addComment(yield Comment.create({ text: 'bar', publishedAt: 'fizz' }).save());
    let result = yield serializer.serialize(post, {}, {});
    t.true(lodash_1.isArray(result.included));
    t.is(result.included[0].attributes.text, 'bar');
    t.falsy(result.included[0].attributes.publishedAt);
    var _a, _b;
}));
ava_1.default.todo('renders resource object meta');
ava_1.default.todo('renders resource object links');
ava_1.default('dasherizes field names', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let container = t.context.container;
    container.register('serializer:post', class TestSerializer extends denali_1.JSONAPISerializer {
        constructor() {
            super(...arguments);
            this.attributes = ['publishedAt'];
            this.relationships = {};
        }
    });
    container.register('model:post', (_a = class Post extends denali_1.Model {
        },
        _a.publishedAt = denali_1.attr('string'),
        _a));
    let db = container.lookup('service:db');
    let serializer = container.lookup('serializer:post');
    let post = yield db.create('post', { publishedAt: 'foo' }).save();
    let result = yield serializer.serialize(post, {}, {});
    t.is(result.data.attributes['published-at'], 'foo');
    var _a;
}));
ava_1.default.todo('renders relationship meta');
ava_1.default.todo('renders relationship links');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvbi1hcGktdGVzdC5qcyIsInNvdXJjZVJvb3QiOiIvVXNlcnMvc2Vhd2F0dHMvc3JjL2dpdGh1Yi5jb20vc2Vhd2F0dHMvZGVuYWxpLyIsInNvdXJjZXMiOlsidGVzdC91bml0L3JlbmRlci9qc29uLWFwaS10ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDBFQUEwRTtBQUMxRSw2QkFBdUI7QUFDdkIsbUNBQWlDO0FBQ2pDLG1DQUE0STtBQUU1SSxhQUFJLENBQUMsVUFBVSxDQUFDLENBQU8sQ0FBQztJQUN0QixJQUFJLFNBQVMsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLFNBQVMsR0FBRyxJQUFJLGtCQUFTLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDL0QsU0FBUyxDQUFDLFFBQVEsQ0FBQyxZQUFZLEVBQUUsd0JBQWUsQ0FBQyxDQUFDO0lBQ2xELFNBQVMsQ0FBQyxRQUFRLENBQUMsbUJBQW1CLEVBQUUsZUFBTSxDQUFDLENBQUM7SUFDaEQsU0FBUyxDQUFDLFFBQVEsQ0FBQyxzQkFBc0IsRUFBRSxlQUFNLENBQUMsQ0FBQztJQUNuRCxTQUFTLENBQUMsUUFBUSxDQUFDLFlBQVksRUFBRSxLQUFNLFNBQVEsZUFBTTtLQUFHLENBQUMsQ0FBQztJQUMxRCxJQUFJLE1BQU0sR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFTLFlBQVksQ0FBQyxDQUFDO0lBQ3BELE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNO1FBQ2hCLE1BQU0sQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLFlBQVksQ0FBQyxDQUFDO0lBQ3JDLENBQUMsQ0FBQyxDQUFDO0lBQ0gsU0FBUyxDQUFDLFFBQVEsQ0FBQyx5QkFBeUIsRUFBRSxLQUFNLFNBQVEsc0JBQWE7S0FBRyxDQUFDLENBQUM7QUFDaEYsQ0FBQyxDQUFBLENBQUMsQ0FBQztBQUVILGFBQUksQ0FBQyw2Q0FBNkMsRUFBRSxDQUFPLENBQUM7SUFDMUQsSUFBSSxTQUFTLEdBQWMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUM7SUFDL0MsU0FBUyxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsRUFBRSxvQkFBcUIsU0FBUSwwQkFBaUI7UUFBOUM7O1lBQ3BDLGVBQVUsR0FBRyxDQUFFLE9BQU8sQ0FBRSxDQUFDO1lBQ3pCLGtCQUFhLEdBQUcsRUFBRSxDQUFDO1FBQ3JCLENBQUM7S0FBQSxDQUFDLENBQUM7SUFDSCxTQUFTLENBQUMsUUFBUSxDQUFDLFlBQVksUUFBRSxVQUFXLFNBQVEsY0FBSztTQUV4RDtRQURRLFFBQUssR0FBRyxhQUFJLENBQUMsUUFBUSxDQUFFO1lBQzlCLENBQUM7SUFDSCxJQUFJLElBQUksR0FBRyxTQUFTLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQzlDLElBQUksVUFBVSxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUMsQ0FBQztJQUVyRCxJQUFJLE9BQU8sR0FBRyxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUN6RCxJQUFJLE1BQU0sR0FBRyxNQUFNLFVBQVUsQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFPLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUU5RCxDQUFDLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQzs7QUFDNUMsQ0FBQyxDQUFBLENBQUMsQ0FBQztBQUVILGFBQUksQ0FBQyxrQ0FBa0MsRUFBRSxDQUFPLENBQUM7SUFDL0MsSUFBSSxTQUFTLEdBQWMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUM7SUFDL0MsU0FBUyxDQUFDLFFBQVEsQ0FBQyx3QkFBd0IsRUFBRSxvQkFBcUIsU0FBUSwwQkFBaUI7UUFBOUM7O1lBQzNDLGVBQVUsR0FBYSxFQUFFLENBQUM7WUFDMUIsa0JBQWEsR0FBRyxFQUFFLENBQUM7UUFDckIsQ0FBQztLQUFBLENBQUMsQ0FBQztJQUNILElBQUksVUFBVSxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUMsd0JBQXdCLENBQUMsQ0FBQztJQUU1RCxJQUFJLE1BQU0sR0FBRyxNQUFNLFVBQVUsQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFNLENBQUMsbUJBQW1CLENBQUMsS0FBSyxDQUFDLEVBQU8sRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBRTVGLENBQUMsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDbkMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxxQkFBcUIsQ0FBQyxDQUFDO0lBQ25ELENBQUMsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDdkMsQ0FBQyxDQUFBLENBQUMsQ0FBQztBQUVILGFBQUksQ0FBQyxtREFBbUQsRUFBRSxDQUFPLENBQUM7SUFDaEUsSUFBSSxTQUFTLEdBQWMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUM7SUFDL0MsU0FBUyxDQUFDLFFBQVEsQ0FBQyx3QkFBd0IsRUFBRSxvQkFBcUIsU0FBUSwwQkFBaUI7UUFBOUM7O1lBQzNDLGVBQVUsR0FBYSxFQUFFLENBQUM7WUFDMUIsa0JBQWEsR0FBRyxFQUFFLENBQUM7UUFDckIsQ0FBQztLQUFBLENBQUMsQ0FBQztJQUNILElBQUksVUFBVSxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUMsd0JBQXdCLENBQUMsQ0FBQztJQUU1RCxJQUFJLEtBQUssR0FBUSxJQUFJLGVBQU0sQ0FBQyxtQkFBbUIsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO0lBQ3pFLEtBQUssQ0FBQyxLQUFLLEdBQUcsVUFBVSxDQUFDO0lBQ3pCLEtBQUssQ0FBQyxNQUFNLEdBQUcsd0JBQXdCLENBQUM7SUFDeEMsSUFBSSxNQUFNLEdBQUcsTUFBTSxVQUFVLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBTyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFFNUQsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQztJQUNuQyxDQUFDLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLDBCQUEwQixDQUFDLENBQUM7SUFDeEQsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxVQUFVLENBQUMsQ0FBQztJQUN6QyxDQUFDLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLHdCQUF3QixDQUFDLENBQUM7SUFDeEQsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSx1QkFBdUIsQ0FBQyxDQUFDO0FBQ3pELENBQUMsQ0FBQSxDQUFDLENBQUM7QUFFSCxhQUFJLENBQUMsMkJBQTJCLEVBQUUsQ0FBTyxDQUFDO0lBQ3hDLElBQUksU0FBUyxHQUFjLENBQUMsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDO0lBQy9DLFNBQVMsQ0FBQyxRQUFRLENBQUMsaUJBQWlCLEVBQUUsb0JBQXFCLFNBQVEsMEJBQWlCO1FBQTlDOztZQUNwQyxlQUFVLEdBQUcsQ0FBRSxPQUFPLENBQUUsQ0FBQztZQUN6QixrQkFBYSxHQUFHO2dCQUNkLFFBQVEsRUFBRTtvQkFDUixRQUFRLEVBQUUsT0FBTztpQkFDbEI7YUFDRixDQUFDO1FBQ0osQ0FBQztLQUFBLENBQUMsQ0FBQztJQUNILFNBQVMsQ0FBQyxRQUFRLENBQUMsb0JBQW9CLEVBQUUsdUJBQXdCLFNBQVEsMEJBQWlCO1FBQWpEOztZQUN2QyxlQUFVLEdBQUcsQ0FBRSxNQUFNLENBQUUsQ0FBQztZQUN4QixrQkFBYSxHQUFHLEVBQUUsQ0FBQztRQUNyQixDQUFDO0tBQUEsQ0FBQyxDQUFDO0lBQ0gsU0FBUyxDQUFDLFFBQVEsQ0FBQyxZQUFZLFFBQUUsVUFBVyxTQUFRLGNBQUs7U0FHeEQ7UUFGUSxRQUFLLEdBQUcsYUFBSSxDQUFDLFFBQVEsQ0FBRTtRQUN2QixXQUFRLEdBQUcsZ0JBQU8sQ0FBQyxTQUFTLENBQUU7WUFDckMsQ0FBQztJQUNILFNBQVMsQ0FBQyxRQUFRLENBQUMsZUFBZSxRQUFFLGFBQWMsU0FBUSxjQUFLO1NBRTlEO1FBRFEsT0FBSSxHQUFHLGFBQUksQ0FBQyxRQUFRLENBQUU7WUFDN0IsQ0FBQztJQUNILElBQUksRUFBRSxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDeEMsSUFBSSxVQUFVLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0lBRXJELElBQUksSUFBSSxHQUFHLE1BQU0sRUFBRSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUM1RCxJQUFJLE9BQU8sR0FBRyxNQUFNLEVBQUUsQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDakUsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQy9CLElBQUksTUFBTSxHQUFHLE1BQU0sVUFBVSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQU8sRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBRTNELENBQUMsQ0FBQyxJQUFJLENBQUMsZ0JBQU8sQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztJQUNqQyxDQUFDLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQzs7QUFDbEQsQ0FBQyxDQUFBLENBQUMsQ0FBQztBQUVILGFBQUksQ0FBQyxJQUFJLENBQUMsb0NBQW9DLENBQUMsQ0FBQztBQUVoRCxhQUFJLENBQUMsb0RBQW9ELEVBQUUsQ0FBTyxDQUFDO0lBQ2pFLElBQUksU0FBUyxHQUFjLENBQUMsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDO0lBQy9DLFNBQVMsQ0FBQyxRQUFRLENBQUMsaUJBQWlCLEVBQUUsb0JBQXFCLFNBQVEsMEJBQWlCO1FBQTlDOztZQUNwQyxlQUFVLEdBQUcsQ0FBRSxPQUFPLENBQUUsQ0FBQztZQUN6QixrQkFBYSxHQUFHO2dCQUNkLFFBQVEsRUFBRTtvQkFDUixRQUFRLEVBQUUsSUFBSTtpQkFDZjthQUNGLENBQUM7UUFDSixDQUFDO0tBQUEsQ0FBQyxDQUFDO0lBQ0gsU0FBUyxDQUFDLFFBQVEsQ0FBQyxvQkFBb0IsRUFBRSx1QkFBd0IsU0FBUSwwQkFBaUI7UUFBakQ7O1lBQ3ZDLGVBQVUsR0FBRyxDQUFFLE1BQU0sQ0FBRSxDQUFDO1lBQ3hCLGtCQUFhLEdBQUcsRUFBRSxDQUFDO1FBQ3JCLENBQUM7S0FBQSxDQUFDLENBQUM7SUFDSCxTQUFTLENBQUMsUUFBUSxDQUFDLFlBQVksUUFBRSxVQUFXLFNBQVEsY0FBSztTQUd4RDtRQUZRLFFBQUssR0FBRyxhQUFJLENBQUMsUUFBUSxDQUFFO1FBQ3ZCLFdBQVEsR0FBRyxnQkFBTyxDQUFDLFNBQVMsQ0FBRTtZQUNyQyxDQUFDO0lBQ0gsU0FBUyxDQUFDLFFBQVEsQ0FBQyxlQUFlLFFBQUUsYUFBYyxTQUFRLGNBQUs7U0FFOUQ7UUFEUSxPQUFJLEdBQUcsYUFBSSxDQUFDLFFBQVEsQ0FBRTtZQUM3QixDQUFDO0lBQ0gsSUFBSSxJQUFJLEdBQUcsU0FBUyxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUM5QyxJQUFJLE9BQU8sR0FBRyxTQUFTLENBQUMsVUFBVSxDQUFDLGVBQWUsQ0FBQyxDQUFDO0lBQ3BELElBQUksVUFBVSxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUMsQ0FBQztJQUVyRCxJQUFJLElBQUksR0FBRyxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUN0RCxJQUFJLE9BQU8sR0FBRyxNQUFNLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUMzRCxNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDL0IsSUFBSSxNQUFNLEdBQUcsTUFBTSxVQUFVLENBQUMsU0FBUyxDQUFDLElBQUksRUFBTyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFFM0QsQ0FBQyxDQUFDLElBQUksQ0FBQyxnQkFBTyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO0lBQ2pDLENBQUMsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3hDLENBQUMsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUM7O0FBQzVDLENBQUMsQ0FBQSxDQUFDLENBQUM7QUFFSCxhQUFJLENBQUMsdUJBQXVCLEVBQUUsQ0FBTyxDQUFDO0lBQ3BDLElBQUksU0FBUyxHQUFjLENBQUMsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDO0lBQy9DLFNBQVMsQ0FBQyxRQUFRLENBQUMsaUJBQWlCLEVBQUUsb0JBQXFCLFNBQVEsMEJBQWlCO1FBQTlDOztZQUNwQyxlQUFVLEdBQWEsRUFBRSxDQUFDO1lBQzFCLGtCQUFhLEdBQUcsRUFBRSxDQUFDO1FBQ3JCLENBQUM7S0FBQSxDQUFDLENBQUM7SUFDSCxTQUFTLENBQUMsUUFBUSxDQUFDLFlBQVksRUFBRSxVQUFXLFNBQVEsY0FBSztLQUFHLENBQUMsQ0FBQztJQUM5RCxJQUFJLElBQUksR0FBRyxTQUFTLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQzlDLElBQUksVUFBVSxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUMsQ0FBQztJQUVyRCxJQUFJLE9BQU8sR0FBRyxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDM0MsSUFBSSxNQUFNLEdBQUcsTUFBTSxVQUFVLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBTyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLEVBQUMsQ0FBQyxDQUFDO0lBRWxGLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUMxQixDQUFDLENBQUEsQ0FBQyxDQUFDO0FBRUgsYUFBSSxDQUFDLHdCQUF3QixFQUFFLENBQU8sQ0FBQztJQUNyQyxJQUFJLFNBQVMsR0FBYyxDQUFDLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQztJQUMvQyxTQUFTLENBQUMsUUFBUSxDQUFDLGlCQUFpQixFQUFFLG9CQUFxQixTQUFRLDBCQUFpQjtRQUE5Qzs7WUFDcEMsZUFBVSxHQUFhLEVBQUUsQ0FBQztZQUMxQixrQkFBYSxHQUFHLEVBQUUsQ0FBQztRQUNyQixDQUFDO0tBQUEsQ0FBQyxDQUFDO0lBQ0gsU0FBUyxDQUFDLFFBQVEsQ0FBQyxZQUFZLEVBQUUsVUFBVyxTQUFRLGNBQUs7S0FBRyxDQUFDLENBQUM7SUFDOUQsSUFBSSxJQUFJLEdBQUcsU0FBUyxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUM5QyxJQUFJLFVBQVUsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLENBQUM7SUFFckQsSUFBSSxPQUFPLEdBQUcsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO0lBQzNDLElBQUksTUFBTSxHQUFHLE1BQU0sVUFBVSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQU8sRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxFQUFDLENBQUMsQ0FBQztJQUVuRixDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDM0IsQ0FBQyxDQUFBLENBQUMsQ0FBQztBQUVILGFBQUksQ0FBQyx5QkFBeUIsRUFBRSxDQUFPLENBQUM7SUFDdEMsSUFBSSxTQUFTLEdBQWMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUM7SUFDL0MsU0FBUyxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsRUFBRSxvQkFBcUIsU0FBUSwwQkFBaUI7UUFBOUM7O1lBQ3BDLGVBQVUsR0FBYSxFQUFFLENBQUM7WUFDMUIsa0JBQWEsR0FBRyxFQUFFLENBQUM7UUFDckIsQ0FBQztLQUFBLENBQUMsQ0FBQztJQUNILFNBQVMsQ0FBQyxRQUFRLENBQUMsWUFBWSxFQUFFLFVBQVcsU0FBUSxjQUFLO0tBQUcsQ0FBQyxDQUFDO0lBQzlELElBQUksSUFBSSxHQUFHLFNBQVMsQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDOUMsSUFBSSxVQUFVLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0lBRXJELElBQUksT0FBTyxHQUFHLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUMzQyxJQUFJLE1BQU0sR0FBRyxNQUFNLFVBQVUsQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFPLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUU5RCxDQUFDLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQ3RDLENBQUMsQ0FBQSxDQUFDLENBQUM7QUFFSCxhQUFJLENBQUMscURBQXFELEVBQUUsQ0FBTyxDQUFDO0lBQ2xFLElBQUksU0FBUyxHQUFjLENBQUMsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDO0lBQy9DLFNBQVMsQ0FBQyxRQUFRLENBQUMsaUJBQWlCLEVBQUUsb0JBQXFCLFNBQVEsMEJBQWlCO1FBQTlDOztZQUNwQyxlQUFVLEdBQUcsQ0FBRSxPQUFPLENBQUUsQ0FBQztZQUN6QixrQkFBYSxHQUFHLEVBQUUsQ0FBQztRQUNyQixDQUFDO0tBQUEsQ0FBQyxDQUFDO0lBQ0gsU0FBUyxDQUFDLFFBQVEsQ0FBQyxZQUFZLFFBQUUsVUFBVyxTQUFRLGNBQUs7U0FFeEQ7UUFEUSxRQUFLLEdBQUcsYUFBSSxDQUFDLFFBQVEsQ0FBRTtZQUM5QixDQUFDO0lBQ0gsSUFBSSxJQUFJLEdBQUcsU0FBUyxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUM5QyxJQUFJLFVBQVUsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLENBQUM7SUFFckQsSUFBSSxPQUFPLEdBQUcsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDekQsSUFBSSxPQUFPLEdBQUcsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDekQsSUFBSSxNQUFNLEdBQUcsTUFBTSxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUUsT0FBTyxFQUFFLE9BQU8sQ0FBRSxFQUFPLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUUzRSxDQUFDLENBQUMsSUFBSSxDQUFDLGdCQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDN0IsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDcEMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7O0FBQ3RDLENBQUMsQ0FBQSxDQUFDLENBQUM7QUFFSCxhQUFJLENBQUMscUNBQXFDLEVBQUUsQ0FBTyxDQUFDO0lBQ2xELElBQUksU0FBUyxHQUFjLENBQUMsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDO0lBQy9DLFNBQVMsQ0FBQyxRQUFRLENBQUMsaUJBQWlCLEVBQUUsb0JBQXFCLFNBQVEsMEJBQWlCO1FBQTlDOztZQUNwQyxlQUFVLEdBQUcsQ0FBRSxPQUFPLENBQUUsQ0FBQztZQUN6QixrQkFBYSxHQUFHLEVBQUUsQ0FBQztRQUNyQixDQUFDO0tBQUEsQ0FBQyxDQUFDO0lBQ0gsU0FBUyxDQUFDLFFBQVEsQ0FBQyxZQUFZLFFBQUUsVUFBVyxTQUFRLGNBQUs7U0FHeEQ7UUFGUSxRQUFLLEdBQUcsYUFBSSxDQUFDLFFBQVEsQ0FBRTtRQUN2QixVQUFPLEdBQUcsYUFBSSxDQUFDLFFBQVEsQ0FBRTtZQUNoQyxDQUFDO0lBQ0gsSUFBSSxJQUFJLEdBQUcsU0FBUyxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUM5QyxJQUFJLFVBQVUsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLENBQUM7SUFFckQsSUFBSSxJQUFJLEdBQUcsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUN0RSxJQUFJLE1BQU0sR0FBRyxNQUFNLFVBQVUsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFPLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUUzRCxDQUFDLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztJQUMxQyxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDOztBQUMxQyxDQUFDLENBQUEsQ0FBQyxDQUFDO0FBRUgsYUFBSSxDQUFDLG9FQUFvRSxFQUFFLENBQU8sQ0FBQztJQUNqRixJQUFJLFNBQVMsR0FBYyxDQUFDLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQztJQUMvQyxTQUFTLENBQUMsUUFBUSxDQUFDLGlCQUFpQixFQUFFLG9CQUFxQixTQUFRLDBCQUFpQjtRQUE5Qzs7WUFDcEMsZUFBVSxHQUFHLENBQUUsT0FBTyxDQUFFLENBQUM7WUFDekIsa0JBQWEsR0FBRyxFQUFFLENBQUM7UUFDckIsQ0FBQztLQUFBLENBQUMsQ0FBQztJQUNILFNBQVMsQ0FBQyxRQUFRLENBQUMsWUFBWSxRQUFFLFVBQVcsU0FBUSxjQUFLO1NBR3hEO1FBRlEsUUFBSyxHQUFHLGFBQUksQ0FBQyxRQUFRLENBQUU7UUFDdkIsVUFBTyxHQUFHLGFBQUksQ0FBQyxRQUFRLENBQUU7WUFDaEMsQ0FBQztJQUNILElBQUksSUFBSSxHQUFHLFNBQVMsQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDOUMsSUFBSSxVQUFVLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0lBRXJELElBQUksSUFBSSxHQUFHLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDdEUsSUFBSSxNQUFNLEdBQUcsTUFBTSxVQUFVLENBQUMsU0FBUyxDQUFDLElBQUksRUFBTyxFQUFFLEVBQUUsRUFBRSxVQUFVLEVBQUUsQ0FBRSxTQUFTLENBQUUsRUFBRSxDQUFDLENBQUM7SUFFdEYsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDNUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQzs7QUFDeEMsQ0FBQyxDQUFBLENBQUMsQ0FBQztBQUVILGFBQUksQ0FBQyx3Q0FBd0MsRUFBRSxDQUFPLENBQUM7SUFDckQsSUFBSSxTQUFTLEdBQWMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUM7SUFDL0MsU0FBUyxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsRUFBRSxvQkFBcUIsU0FBUSwwQkFBaUI7UUFBOUM7O1lBQ3BDLGVBQVUsR0FBRyxDQUFFLE9BQU8sQ0FBRSxDQUFDO1lBQ3pCLGtCQUFhLEdBQUc7Z0JBQ2QsUUFBUSxFQUFFO29CQUNSLFFBQVEsRUFBRSxJQUFJO2lCQUNmO2FBQ0YsQ0FBQztRQUNKLENBQUM7S0FBQSxDQUFDLENBQUM7SUFDSCxTQUFTLENBQUMsUUFBUSxDQUFDLG9CQUFvQixFQUFFLHVCQUF3QixTQUFRLDBCQUFpQjtRQUFqRDs7WUFDdkMsZUFBVSxHQUFHLENBQUUsTUFBTSxDQUFFLENBQUM7WUFDeEIsa0JBQWEsR0FBRyxFQUFFLENBQUM7UUFDckIsQ0FBQztLQUFBLENBQUMsQ0FBQztJQUNILFNBQVMsQ0FBQyxRQUFRLENBQUMsWUFBWSxRQUFFLFVBQVcsU0FBUSxjQUFLO1NBSXhEO1FBSFEsUUFBSyxHQUFHLGFBQUksQ0FBQyxRQUFRLENBQUU7UUFDdkIsU0FBTSxHQUFHLGVBQU0sQ0FBQyxNQUFNLENBQUU7UUFDeEIsV0FBUSxHQUFHLGdCQUFPLENBQUMsU0FBUyxDQUFFO1lBQ3JDLENBQUM7SUFDSCxTQUFTLENBQUMsUUFBUSxDQUFDLGVBQWUsUUFBRSxhQUFjLFNBQVEsY0FBSztTQUU5RDtRQURRLE9BQUksR0FBRyxhQUFJLENBQUMsUUFBUSxDQUFFO1lBQzdCLENBQUM7SUFDSCxTQUFTLENBQUMsUUFBUSxDQUFDLFlBQVksRUFBRSxhQUFjLFNBQVEsY0FBSztLQUFHLENBQUMsQ0FBQztJQUNqRSxJQUFJLElBQUksR0FBRyxTQUFTLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQzlDLElBQUksVUFBVSxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUMsQ0FBQztJQUVyRCxJQUFJLElBQUksR0FBRyxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUN0RCxJQUFJLE1BQU0sR0FBRyxNQUFNLFVBQVUsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFPLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUUzRCxDQUFDLENBQUMsSUFBSSxDQUFDLGdCQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDekQsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQzs7QUFDNUMsQ0FBQyxDQUFBLENBQUMsQ0FBQztBQUVILGFBQUksQ0FBQyx1RUFBdUUsRUFBRSxDQUFPLENBQUM7SUFDcEYsSUFBSSxTQUFTLEdBQWMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUM7SUFDL0MsU0FBUyxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsRUFBRSxvQkFBcUIsU0FBUSwwQkFBaUI7UUFBOUM7O1lBQ3BDLGVBQVUsR0FBRyxDQUFFLE9BQU8sQ0FBRSxDQUFDO1lBQ3pCLGtCQUFhLEdBQUc7Z0JBQ2QsTUFBTSxFQUFFO29CQUNOLFFBQVEsRUFBRSxJQUFJO2lCQUNmO2FBQ0YsQ0FBQztRQUNKLENBQUM7S0FBQSxDQUFDLENBQUM7SUFDSCxTQUFTLENBQUMsUUFBUSxDQUFDLHFCQUFxQixFQUFFLHVCQUF3QixTQUFRLDBCQUFpQjtRQUFqRDs7WUFDeEMsZUFBVSxHQUFHLENBQUUsT0FBTyxDQUFFLENBQUM7WUFDekIsa0JBQWEsR0FBRyxFQUFFLENBQUM7UUFDckIsQ0FBQztLQUFBLENBQUMsQ0FBQztJQUNILFNBQVMsQ0FBQyxRQUFRLENBQUMsWUFBWSxRQUFFLFVBQVcsU0FBUSxjQUFLO1NBSXhEO1FBSFEsUUFBSyxHQUFHLGFBQUksQ0FBQyxRQUFRLENBQUU7UUFDdkIsU0FBTSxHQUFHLGVBQU0sQ0FBQyxNQUFNLENBQUU7UUFDeEIsV0FBUSxHQUFHLGdCQUFPLENBQUMsU0FBUyxDQUFFO1lBQ3JDLENBQUM7SUFDSCxTQUFTLENBQUMsUUFBUSxDQUFDLGVBQWUsUUFBRSxhQUFjLFNBQVEsY0FBSztTQUU5RDtRQURRLE9BQUksR0FBRyxhQUFJLENBQUMsUUFBUSxDQUFFO1lBQzdCLENBQUM7SUFDSCxTQUFTLENBQUMsUUFBUSxDQUFDLFlBQVksRUFBRSxhQUFjLFNBQVEsY0FBSztLQUFHLENBQUMsQ0FBQztJQUNqRSxJQUFJLElBQUksR0FBRyxTQUFTLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQzlDLElBQUksVUFBVSxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUMsQ0FBQztJQUVyRCxJQUFJLElBQUksR0FBRyxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUN0RCxJQUFJLE1BQU0sR0FBRyxNQUFNLFVBQVUsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFPLEVBQUUsRUFBRTtRQUNyRCxhQUFhLEVBQUU7WUFDYixRQUFRLEVBQUU7Z0JBQ1IsUUFBUSxFQUFFLElBQUk7YUFDZjtTQUNGO0tBQ0YsQ0FBQyxDQUFDO0lBRUgsQ0FBQyxDQUFDLElBQUksQ0FBQyxnQkFBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ3pELENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUM7O0FBQzVDLENBQUMsQ0FBQSxDQUFDLENBQUM7QUFFSCxhQUFJLENBQUMsb0RBQW9ELEVBQUUsQ0FBTyxDQUFDO0lBQ2pFLElBQUksU0FBUyxHQUFjLENBQUMsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDO0lBQy9DLFNBQVMsQ0FBQyxRQUFRLENBQUMsaUJBQWlCLEVBQUUsb0JBQXFCLFNBQVEsMEJBQWlCO1FBQTlDOztZQUNwQyxlQUFVLEdBQUcsQ0FBRSxPQUFPLENBQUUsQ0FBQztZQUN6QixrQkFBYSxHQUFHO2dCQUNkLFFBQVEsRUFBRTtvQkFDUixRQUFRLEVBQUUsT0FBTztpQkFDbEI7YUFDRixDQUFDO1FBQ0osQ0FBQztLQUFBLENBQUMsQ0FBQztJQUNILFNBQVMsQ0FBQyxRQUFRLENBQUMsb0JBQW9CLEVBQUUsdUJBQXdCLFNBQVEsMEJBQWlCO1FBQWpEOztZQUN2QyxlQUFVLEdBQUcsQ0FBRSxNQUFNLENBQUUsQ0FBQztZQUN4QixrQkFBYSxHQUFHLEVBQUUsQ0FBQztRQUNyQixDQUFDO0tBQUEsQ0FBQyxDQUFDO0lBQ0gsU0FBUyxDQUFDLFFBQVEsQ0FBQyxZQUFZLFFBQUUsVUFBVyxTQUFRLGNBQUs7U0FHeEQ7UUFGUSxRQUFLLEdBQUcsYUFBSSxDQUFDLFFBQVEsQ0FBRTtRQUN2QixXQUFRLEdBQUcsZ0JBQU8sQ0FBQyxTQUFTLENBQUU7WUFDckMsQ0FBQztJQUNILFNBQVMsQ0FBQyxRQUFRLENBQUMsZUFBZSxRQUFFLGFBQWMsU0FBUSxjQUFLO1NBRzlEO1FBRlEsT0FBSSxHQUFHLGFBQUksQ0FBQyxRQUFRLENBQUU7UUFDdEIsY0FBVyxHQUFHLGFBQUksQ0FBQyxRQUFRLENBQUU7WUFDcEMsQ0FBQztJQUNILElBQUksSUFBSSxHQUFHLFNBQVMsQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDOUMsSUFBSSxPQUFPLEdBQUcsU0FBUyxDQUFDLFVBQVUsQ0FBQyxlQUFlLENBQUMsQ0FBQztJQUNwRCxJQUFJLFVBQVUsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLENBQUM7SUFFckQsSUFBSSxJQUFJLEdBQUcsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDdEQsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztJQUN6RixJQUFJLE1BQU0sR0FBRyxNQUFNLFVBQVUsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFPLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUUzRCxDQUFDLENBQUMsSUFBSSxDQUFDLGdCQUFPLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7SUFDakMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDaEQsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQzs7QUFDckQsQ0FBQyxDQUFBLENBQUMsQ0FBQztBQUVILGFBQUksQ0FBQyxJQUFJLENBQUMsOEJBQThCLENBQUMsQ0FBQztBQUUxQyxhQUFJLENBQUMsSUFBSSxDQUFDLCtCQUErQixDQUFDLENBQUM7QUFFM0MsYUFBSSxDQUFDLHdCQUF3QixFQUFFLENBQU8sQ0FBQztJQUNyQyxJQUFJLFNBQVMsR0FBYyxDQUFDLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQztJQUMvQyxTQUFTLENBQUMsUUFBUSxDQUFDLGlCQUFpQixFQUFFLG9CQUFxQixTQUFRLDBCQUFpQjtRQUE5Qzs7WUFDcEMsZUFBVSxHQUFHLENBQUUsYUFBYSxDQUFFLENBQUM7WUFDL0Isa0JBQWEsR0FBRyxFQUFFLENBQUM7UUFDckIsQ0FBQztLQUFBLENBQUMsQ0FBQztJQUNILFNBQVMsQ0FBQyxRQUFRLENBQUMsWUFBWSxRQUFFLFVBQVcsU0FBUSxjQUFLO1NBRXhEO1FBRFEsY0FBVyxHQUFHLGFBQUksQ0FBQyxRQUFRLENBQUU7WUFDcEMsQ0FBQztJQUNILElBQUksRUFBRSxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDeEMsSUFBSSxVQUFVLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0lBRXJELElBQUksSUFBSSxHQUFHLE1BQU0sRUFBRSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUNsRSxJQUFJLE1BQU0sR0FBRyxNQUFNLFVBQVUsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFPLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUUzRCxDQUFDLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLGNBQWMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDOztBQUN0RCxDQUFDLENBQUEsQ0FBQyxDQUFDO0FBRUgsYUFBSSxDQUFDLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO0FBRXZDLGFBQUksQ0FBQyxJQUFJLENBQUMsNEJBQTRCLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qIHRzbGludDpkaXNhYmxlOmNvbXBsZXRlZC1kb2NzIG5vLWVtcHR5IG5vLWludmFsaWQtdGhpcyBtZW1iZXItYWNjZXNzICovXG5pbXBvcnQgdGVzdCBmcm9tICdhdmEnO1xuaW1wb3J0IHsgaXNBcnJheSB9IGZyb20gJ2xvZGFzaCc7XG5pbXBvcnQgeyBKU09OQVBJU2VyaWFsaXplciwgTW9kZWwsIGF0dHIsIENvbnRhaW5lciwgTWVtb3J5QWRhcHRlciwgUm91dGVyLCBBY3Rpb24sIGhhc01hbnksIEVycm9ycywgaGFzT25lLCBEYXRhYmFzZVNlcnZpY2UgfSBmcm9tICdkZW5hbGknO1xuXG50ZXN0LmJlZm9yZUVhY2goYXN5bmMgKHQpID0+IHtcbiAgbGV0IGNvbnRhaW5lciA9IHQuY29udGV4dC5jb250YWluZXIgPSBuZXcgQ29udGFpbmVyKF9fZGlybmFtZSk7XG4gIGNvbnRhaW5lci5yZWdpc3Rlcignc2VydmljZTpkYicsIERhdGFiYXNlU2VydmljZSk7XG4gIGNvbnRhaW5lci5yZWdpc3RlcignYWN0aW9uOnBvc3RzL3Nob3cnLCBBY3Rpb24pO1xuICBjb250YWluZXIucmVnaXN0ZXIoJ2FjdGlvbjpjb21tZW50cy9zaG93JywgQWN0aW9uKTtcbiAgY29udGFpbmVyLnJlZ2lzdGVyKCdhcHA6cm91dGVyJywgY2xhc3MgZXh0ZW5kcyBSb3V0ZXIge30pO1xuICBsZXQgcm91dGVyID0gY29udGFpbmVyLmxvb2t1cDxSb3V0ZXI+KCdhcHA6cm91dGVyJyk7XG4gIHJvdXRlci5tYXAoKHJvdXRlcikgPT4ge1xuICAgIHJvdXRlci5nZXQoJy9wb3N0cycsICdwb3N0cy9zaG93Jyk7XG4gIH0pO1xuICBjb250YWluZXIucmVnaXN0ZXIoJ29ybS1hZGFwdGVyOmFwcGxpY2F0aW9uJywgY2xhc3MgZXh0ZW5kcyBNZW1vcnlBZGFwdGVyIHt9KTtcbn0pO1xuXG50ZXN0KCdyZW5kZXJzIG1vZGVscyBhcyBKU09OLUFQSSByZXNvdXJjZSBvYmplY3RzJywgYXN5bmMgKHQpID0+IHtcbiAgbGV0IGNvbnRhaW5lciA9IDxDb250YWluZXI+dC5jb250ZXh0LmNvbnRhaW5lcjtcbiAgY29udGFpbmVyLnJlZ2lzdGVyKCdzZXJpYWxpemVyOnBvc3QnLCBjbGFzcyBUZXN0U2VyaWFsaXplciBleHRlbmRzIEpTT05BUElTZXJpYWxpemVyIHtcbiAgICBhdHRyaWJ1dGVzID0gWyAndGl0bGUnIF07XG4gICAgcmVsYXRpb25zaGlwcyA9IHt9O1xuICB9KTtcbiAgY29udGFpbmVyLnJlZ2lzdGVyKCdtb2RlbDpwb3N0JywgY2xhc3MgUG9zdCBleHRlbmRzIE1vZGVsIHtcbiAgICBzdGF0aWMgdGl0bGUgPSBhdHRyKCdzdHJpbmcnKTtcbiAgfSk7XG4gIGxldCBQb3N0ID0gY29udGFpbmVyLmZhY3RvcnlGb3IoJ21vZGVsOnBvc3QnKTtcbiAgbGV0IHNlcmlhbGl6ZXIgPSBjb250YWluZXIubG9va3VwKCdzZXJpYWxpemVyOnBvc3QnKTtcblxuICBsZXQgcGF5bG9hZCA9IGF3YWl0IFBvc3QuY3JlYXRlKHsgdGl0bGU6ICdmb28nIH0pLnNhdmUoKTtcbiAgbGV0IHJlc3VsdCA9IGF3YWl0IHNlcmlhbGl6ZXIuc2VyaWFsaXplKHBheWxvYWQsIDxhbnk+e30sIHt9KTtcblxuICB0LmlzKHJlc3VsdC5kYXRhLmF0dHJpYnV0ZXMudGl0bGUsICdmb28nKTtcbn0pO1xuXG50ZXN0KCdyZW5kZXJzIGVycm9ycyBhY2NvcmRpbmcgdG8gc3BlYycsIGFzeW5jICh0KSA9PiB7XG4gIGxldCBjb250YWluZXIgPSA8Q29udGFpbmVyPnQuY29udGV4dC5jb250YWluZXI7XG4gIGNvbnRhaW5lci5yZWdpc3Rlcignc2VyaWFsaXplcjphcHBsaWNhdGlvbicsIGNsYXNzIFRlc3RTZXJpYWxpemVyIGV4dGVuZHMgSlNPTkFQSVNlcmlhbGl6ZXIge1xuICAgIGF0dHJpYnV0ZXM6IHN0cmluZ1tdID0gW107XG4gICAgcmVsYXRpb25zaGlwcyA9IHt9O1xuICB9KTtcbiAgbGV0IHNlcmlhbGl6ZXIgPSBjb250YWluZXIubG9va3VwKCdzZXJpYWxpemVyOmFwcGxpY2F0aW9uJyk7XG5cbiAgbGV0IHJlc3VsdCA9IGF3YWl0IHNlcmlhbGl6ZXIuc2VyaWFsaXplKG5ldyBFcnJvcnMuSW50ZXJuYWxTZXJ2ZXJFcnJvcignZm9vJyksIDxhbnk+e30sIHt9KTtcblxuICB0LmlzKHJlc3VsdC5lcnJvcnNbMF0uc3RhdHVzLCA1MDApO1xuICB0LmlzKHJlc3VsdC5lcnJvcnNbMF0uY29kZSwgJ0ludGVybmFsU2VydmVyRXJyb3InKTtcbiAgdC5pcyhyZXN1bHQuZXJyb3JzWzBdLmRldGFpbCwgJ2ZvbycpO1xufSk7XG5cbnRlc3QoJ3JlbmRlcnMgdmFsaWRhdGlvbiBlcnJvcnMgd2l0aCBhZGRpdGlvbmFsIGRldGFpbHMnLCBhc3luYyAodCkgPT4ge1xuICBsZXQgY29udGFpbmVyID0gPENvbnRhaW5lcj50LmNvbnRleHQuY29udGFpbmVyO1xuICBjb250YWluZXIucmVnaXN0ZXIoJ3NlcmlhbGl6ZXI6YXBwbGljYXRpb24nLCBjbGFzcyBUZXN0U2VyaWFsaXplciBleHRlbmRzIEpTT05BUElTZXJpYWxpemVyIHtcbiAgICBhdHRyaWJ1dGVzOiBzdHJpbmdbXSA9IFtdO1xuICAgIHJlbGF0aW9uc2hpcHMgPSB7fTtcbiAgfSk7XG4gIGxldCBzZXJpYWxpemVyID0gY29udGFpbmVyLmxvb2t1cCgnc2VyaWFsaXplcjphcHBsaWNhdGlvbicpO1xuXG4gIGxldCBlcnJvciA9IDxhbnk+bmV3IEVycm9ycy5VbnByb2Nlc3NhYmxlRW50aXR5KCdFbWFpbCBjYW5ub3QgYmUgYmxhbmsnKTtcbiAgZXJyb3IudGl0bGUgPSAncHJlc2VuY2UnO1xuICBlcnJvci5zb3VyY2UgPSAnL2RhdGEvYXR0cmlidXRlcy9lbWFpbCc7XG4gIGxldCByZXN1bHQgPSBhd2FpdCBzZXJpYWxpemVyLnNlcmlhbGl6ZShlcnJvciwgPGFueT57fSwge30pO1xuXG4gIHQuaXMocmVzdWx0LmVycm9yc1swXS5zdGF0dXMsIDQyMik7XG4gIHQuaXMocmVzdWx0LmVycm9yc1swXS5jb2RlLCAnVW5wcm9jZXNzYWJsZUVudGl0eUVycm9yJyk7XG4gIHQuaXMocmVzdWx0LmVycm9yc1swXS50aXRsZSwgJ3ByZXNlbmNlJyk7XG4gIHQuaXMocmVzdWx0LmVycm9yc1swXS5zb3VyY2UsICcvZGF0YS9hdHRyaWJ1dGVzL2VtYWlsJyk7XG4gIHQuaXMocmVzdWx0LmVycm9yc1swXS5kZXRhaWwsICdFbWFpbCBjYW5ub3QgYmUgYmxhbmsnKTtcbn0pO1xuXG50ZXN0KCdzaWRlbG9hZHMgcmVsYXRlZCByZWNvcmRzJywgYXN5bmMgKHQpID0+IHtcbiAgbGV0IGNvbnRhaW5lciA9IDxDb250YWluZXI+dC5jb250ZXh0LmNvbnRhaW5lcjtcbiAgY29udGFpbmVyLnJlZ2lzdGVyKCdzZXJpYWxpemVyOnBvc3QnLCBjbGFzcyBQb3N0U2VyaWFsaXplciBleHRlbmRzIEpTT05BUElTZXJpYWxpemVyIHtcbiAgICBhdHRyaWJ1dGVzID0gWyAndGl0bGUnIF07XG4gICAgcmVsYXRpb25zaGlwcyA9IHtcbiAgICAgIGNvbW1lbnRzOiB7XG4gICAgICAgIHN0cmF0ZWd5OiAnZW1iZWQnXG4gICAgICB9XG4gICAgfTtcbiAgfSk7XG4gIGNvbnRhaW5lci5yZWdpc3Rlcignc2VyaWFsaXplcjpjb21tZW50JywgY2xhc3MgQ29tbWVudFNlcmlhbGl6ZXIgZXh0ZW5kcyBKU09OQVBJU2VyaWFsaXplciB7XG4gICAgYXR0cmlidXRlcyA9IFsgJ3RleHQnIF07XG4gICAgcmVsYXRpb25zaGlwcyA9IHt9O1xuICB9KTtcbiAgY29udGFpbmVyLnJlZ2lzdGVyKCdtb2RlbDpwb3N0JywgY2xhc3MgUG9zdCBleHRlbmRzIE1vZGVsIHtcbiAgICBzdGF0aWMgdGl0bGUgPSBhdHRyKCdzdHJpbmcnKTtcbiAgICBzdGF0aWMgY29tbWVudHMgPSBoYXNNYW55KCdjb21tZW50Jyk7XG4gIH0pO1xuICBjb250YWluZXIucmVnaXN0ZXIoJ21vZGVsOmNvbW1lbnQnLCBjbGFzcyBDb21tZW50IGV4dGVuZHMgTW9kZWwge1xuICAgIHN0YXRpYyB0ZXh0ID0gYXR0cignc3RyaW5nJyk7XG4gIH0pO1xuICBsZXQgZGIgPSBjb250YWluZXIubG9va3VwKCdzZXJ2aWNlOmRiJyk7XG4gIGxldCBzZXJpYWxpemVyID0gY29udGFpbmVyLmxvb2t1cCgnc2VyaWFsaXplcjpwb3N0Jyk7XG5cbiAgbGV0IHBvc3QgPSBhd2FpdCBkYi5jcmVhdGUoJ3Bvc3QnLCB7IHRpdGxlOiAnZm9vJyB9KS5zYXZlKCk7XG4gIGxldCBjb21tZW50ID0gYXdhaXQgZGIuY3JlYXRlKCdjb21tZW50JywgeyB0ZXh0OiAnYmFyJyB9KS5zYXZlKCk7XG4gIGF3YWl0IHBvc3QuYWRkQ29tbWVudChjb21tZW50KTtcbiAgbGV0IHJlc3VsdCA9IGF3YWl0IHNlcmlhbGl6ZXIuc2VyaWFsaXplKHBvc3QsIDxhbnk+e30sIHt9KTtcblxuICB0LnRydWUoaXNBcnJheShyZXN1bHQuaW5jbHVkZWQpKTtcbiAgdC5pcyhyZXN1bHQuaW5jbHVkZWRbMF0uYXR0cmlidXRlcy50ZXh0LCAnYmFyJyk7XG59KTtcblxudGVzdC50b2RvKCdkZWR1cGVzIHNpZGVsb2FkZWQgcmVsYXRlZCByZWNvcmRzJyk7XG5cbnRlc3QoJ2VtYmVkcyByZWxhdGVkIHJlY29yZHMgYXMgcmVzb3VyY2UgbGlua2FnZSBvYmplY3RzJywgYXN5bmMgKHQpID0+IHtcbiAgbGV0IGNvbnRhaW5lciA9IDxDb250YWluZXI+dC5jb250ZXh0LmNvbnRhaW5lcjtcbiAgY29udGFpbmVyLnJlZ2lzdGVyKCdzZXJpYWxpemVyOnBvc3QnLCBjbGFzcyBQb3N0U2VyaWFsaXplciBleHRlbmRzIEpTT05BUElTZXJpYWxpemVyIHtcbiAgICBhdHRyaWJ1dGVzID0gWyAndGl0bGUnIF07XG4gICAgcmVsYXRpb25zaGlwcyA9IHtcbiAgICAgIGNvbW1lbnRzOiB7XG4gICAgICAgIHN0cmF0ZWd5OiAnaWQnXG4gICAgICB9XG4gICAgfTtcbiAgfSk7XG4gIGNvbnRhaW5lci5yZWdpc3Rlcignc2VyaWFsaXplcjpjb21tZW50JywgY2xhc3MgQ29tbWVudFNlcmlhbGl6ZXIgZXh0ZW5kcyBKU09OQVBJU2VyaWFsaXplciB7XG4gICAgYXR0cmlidXRlcyA9IFsgJ3RleHQnIF07XG4gICAgcmVsYXRpb25zaGlwcyA9IHt9O1xuICB9KTtcbiAgY29udGFpbmVyLnJlZ2lzdGVyKCdtb2RlbDpwb3N0JywgY2xhc3MgUG9zdCBleHRlbmRzIE1vZGVsIHtcbiAgICBzdGF0aWMgdGl0bGUgPSBhdHRyKCdzdHJpbmcnKTtcbiAgICBzdGF0aWMgY29tbWVudHMgPSBoYXNNYW55KCdjb21tZW50Jyk7XG4gIH0pO1xuICBjb250YWluZXIucmVnaXN0ZXIoJ21vZGVsOmNvbW1lbnQnLCBjbGFzcyBDb21tZW50IGV4dGVuZHMgTW9kZWwge1xuICAgIHN0YXRpYyB0ZXh0ID0gYXR0cignc3RyaW5nJyk7XG4gIH0pO1xuICBsZXQgUG9zdCA9IGNvbnRhaW5lci5mYWN0b3J5Rm9yKCdtb2RlbDpwb3N0Jyk7XG4gIGxldCBDb21tZW50ID0gY29udGFpbmVyLmZhY3RvcnlGb3IoJ21vZGVsOmNvbW1lbnQnKTtcbiAgbGV0IHNlcmlhbGl6ZXIgPSBjb250YWluZXIubG9va3VwKCdzZXJpYWxpemVyOnBvc3QnKTtcblxuICBsZXQgcG9zdCA9IGF3YWl0IFBvc3QuY3JlYXRlKHsgdGl0bGU6ICdmb28nIH0pLnNhdmUoKTtcbiAgbGV0IGNvbW1lbnQgPSBhd2FpdCBDb21tZW50LmNyZWF0ZSh7IHRleHQ6ICdiYXInIH0pLnNhdmUoKTtcbiAgYXdhaXQgcG9zdC5hZGRDb21tZW50KGNvbW1lbnQpO1xuICBsZXQgcmVzdWx0ID0gYXdhaXQgc2VyaWFsaXplci5zZXJpYWxpemUocG9zdCwgPGFueT57fSwge30pO1xuXG4gIHQudHJ1ZShpc0FycmF5KHJlc3VsdC5pbmNsdWRlZCkpO1xuICB0LmlzKHJlc3VsdC5pbmNsdWRlZFswXS5pZCwgY29tbWVudC5pZCk7XG4gIHQuaXMocmVzdWx0LmluY2x1ZGVkWzBdLnR5cGUsICdjb21tZW50cycpO1xufSk7XG5cbnRlc3QoJ3JlbmRlcnMgZG9jdW1lbnQgbWV0YScsIGFzeW5jICh0KSA9PiB7XG4gIGxldCBjb250YWluZXIgPSA8Q29udGFpbmVyPnQuY29udGV4dC5jb250YWluZXI7XG4gIGNvbnRhaW5lci5yZWdpc3Rlcignc2VyaWFsaXplcjpwb3N0JywgY2xhc3MgVGVzdFNlcmlhbGl6ZXIgZXh0ZW5kcyBKU09OQVBJU2VyaWFsaXplciB7XG4gICAgYXR0cmlidXRlczogc3RyaW5nW10gPSBbXTtcbiAgICByZWxhdGlvbnNoaXBzID0ge307XG4gIH0pO1xuICBjb250YWluZXIucmVnaXN0ZXIoJ21vZGVsOnBvc3QnLCBjbGFzcyBQb3N0IGV4dGVuZHMgTW9kZWwge30pO1xuICBsZXQgUG9zdCA9IGNvbnRhaW5lci5mYWN0b3J5Rm9yKCdtb2RlbDpwb3N0Jyk7XG4gIGxldCBzZXJpYWxpemVyID0gY29udGFpbmVyLmxvb2t1cCgnc2VyaWFsaXplcjpwb3N0Jyk7XG5cbiAgbGV0IHBheWxvYWQgPSBhd2FpdCBQb3N0LmNyZWF0ZSh7fSkuc2F2ZSgpO1xuICBsZXQgcmVzdWx0ID0gYXdhaXQgc2VyaWFsaXplci5zZXJpYWxpemUocGF5bG9hZCwgPGFueT57fSwgeyBtZXRhOiB7IGZvbzogdHJ1ZSB9fSk7XG5cbiAgdC50cnVlKHJlc3VsdC5tZXRhLmZvbyk7XG59KTtcblxudGVzdCgncmVuZGVycyBkb2N1bWVudCBsaW5rcycsIGFzeW5jICh0KSA9PiB7XG4gIGxldCBjb250YWluZXIgPSA8Q29udGFpbmVyPnQuY29udGV4dC5jb250YWluZXI7XG4gIGNvbnRhaW5lci5yZWdpc3Rlcignc2VyaWFsaXplcjpwb3N0JywgY2xhc3MgVGVzdFNlcmlhbGl6ZXIgZXh0ZW5kcyBKU09OQVBJU2VyaWFsaXplciB7XG4gICAgYXR0cmlidXRlczogc3RyaW5nW10gPSBbXTtcbiAgICByZWxhdGlvbnNoaXBzID0ge307XG4gIH0pO1xuICBjb250YWluZXIucmVnaXN0ZXIoJ21vZGVsOnBvc3QnLCBjbGFzcyBQb3N0IGV4dGVuZHMgTW9kZWwge30pO1xuICBsZXQgUG9zdCA9IGNvbnRhaW5lci5mYWN0b3J5Rm9yKCdtb2RlbDpwb3N0Jyk7XG4gIGxldCBzZXJpYWxpemVyID0gY29udGFpbmVyLmxvb2t1cCgnc2VyaWFsaXplcjpwb3N0Jyk7XG5cbiAgbGV0IHBheWxvYWQgPSBhd2FpdCBQb3N0LmNyZWF0ZSh7fSkuc2F2ZSgpO1xuICBsZXQgcmVzdWx0ID0gYXdhaXQgc2VyaWFsaXplci5zZXJpYWxpemUocGF5bG9hZCwgPGFueT57fSwgeyBsaW5rczogeyBmb286IHRydWUgfX0pO1xuXG4gIHQudHJ1ZShyZXN1bHQubGlua3MuZm9vKTtcbn0pO1xuXG50ZXN0KCdyZW5kZXJzIGpzb25hcGkgdmVyc2lvbicsIGFzeW5jICh0KSA9PiB7XG4gIGxldCBjb250YWluZXIgPSA8Q29udGFpbmVyPnQuY29udGV4dC5jb250YWluZXI7XG4gIGNvbnRhaW5lci5yZWdpc3Rlcignc2VyaWFsaXplcjpwb3N0JywgY2xhc3MgVGVzdFNlcmlhbGl6ZXIgZXh0ZW5kcyBKU09OQVBJU2VyaWFsaXplciB7XG4gICAgYXR0cmlidXRlczogc3RyaW5nW10gPSBbXTtcbiAgICByZWxhdGlvbnNoaXBzID0ge307XG4gIH0pO1xuICBjb250YWluZXIucmVnaXN0ZXIoJ21vZGVsOnBvc3QnLCBjbGFzcyBQb3N0IGV4dGVuZHMgTW9kZWwge30pO1xuICBsZXQgUG9zdCA9IGNvbnRhaW5lci5mYWN0b3J5Rm9yKCdtb2RlbDpwb3N0Jyk7XG4gIGxldCBzZXJpYWxpemVyID0gY29udGFpbmVyLmxvb2t1cCgnc2VyaWFsaXplcjpwb3N0Jyk7XG5cbiAgbGV0IHBheWxvYWQgPSBhd2FpdCBQb3N0LmNyZWF0ZSh7fSkuc2F2ZSgpO1xuICBsZXQgcmVzdWx0ID0gYXdhaXQgc2VyaWFsaXplci5zZXJpYWxpemUocGF5bG9hZCwgPGFueT57fSwge30pO1xuXG4gIHQuaXMocmVzdWx0Lmpzb25hcGkudmVyc2lvbiwgJzEuMCcpO1xufSk7XG5cbnRlc3QoJ3JlbmRlcnMgYW4gYXJyYXkgb2YgbW9kZWxzIGFzIGFuIGFycmF5IHVuZGVyIGBkYXRhYCcsIGFzeW5jICh0KSA9PiB7XG4gIGxldCBjb250YWluZXIgPSA8Q29udGFpbmVyPnQuY29udGV4dC5jb250YWluZXI7XG4gIGNvbnRhaW5lci5yZWdpc3Rlcignc2VyaWFsaXplcjpwb3N0JywgY2xhc3MgVGVzdFNlcmlhbGl6ZXIgZXh0ZW5kcyBKU09OQVBJU2VyaWFsaXplciB7XG4gICAgYXR0cmlidXRlcyA9IFsgJ3RpdGxlJyBdO1xuICAgIHJlbGF0aW9uc2hpcHMgPSB7fTtcbiAgfSk7XG4gIGNvbnRhaW5lci5yZWdpc3RlcignbW9kZWw6cG9zdCcsIGNsYXNzIFBvc3QgZXh0ZW5kcyBNb2RlbCB7XG4gICAgc3RhdGljIHRpdGxlID0gYXR0cignc3RyaW5nJyk7XG4gIH0pO1xuICBsZXQgUG9zdCA9IGNvbnRhaW5lci5mYWN0b3J5Rm9yKCdtb2RlbDpwb3N0Jyk7XG4gIGxldCBzZXJpYWxpemVyID0gY29udGFpbmVyLmxvb2t1cCgnc2VyaWFsaXplcjpwb3N0Jyk7XG5cbiAgbGV0IHBvc3RPbmUgPSBhd2FpdCBQb3N0LmNyZWF0ZSh7IHRpdGxlOiAnZm9vJyB9KS5zYXZlKCk7XG4gIGxldCBwb3N0VHdvID0gYXdhaXQgUG9zdC5jcmVhdGUoeyB0aXRsZTogJ2JhcicgfSkuc2F2ZSgpO1xuICBsZXQgcmVzdWx0ID0gYXdhaXQgc2VyaWFsaXplci5zZXJpYWxpemUoWyBwb3N0T25lLCBwb3N0VHdvIF0sIDxhbnk+e30sIHt9KTtcblxuICB0LnRydWUoaXNBcnJheShyZXN1bHQuZGF0YSkpO1xuICB0LmlzKHJlc3VsdC5kYXRhWzBdLmlkLCBwb3N0T25lLmlkKTtcbiAgdC5pcyhyZXN1bHQuZGF0YVsxXS5pZCwgcG9zdFR3by5pZCk7XG59KTtcblxudGVzdCgnb25seSByZW5kZXJzIHdoaXRlbGlzdGVkIGF0dHJpYnV0ZXMnLCBhc3luYyAodCkgPT4ge1xuICBsZXQgY29udGFpbmVyID0gPENvbnRhaW5lcj50LmNvbnRleHQuY29udGFpbmVyO1xuICBjb250YWluZXIucmVnaXN0ZXIoJ3NlcmlhbGl6ZXI6cG9zdCcsIGNsYXNzIFBvc3RTZXJpYWxpemVyIGV4dGVuZHMgSlNPTkFQSVNlcmlhbGl6ZXIge1xuICAgIGF0dHJpYnV0ZXMgPSBbICd0aXRsZScgXTtcbiAgICByZWxhdGlvbnNoaXBzID0ge307XG4gIH0pO1xuICBjb250YWluZXIucmVnaXN0ZXIoJ21vZGVsOnBvc3QnLCBjbGFzcyBQb3N0IGV4dGVuZHMgTW9kZWwge1xuICAgIHN0YXRpYyB0aXRsZSA9IGF0dHIoJ3N0cmluZycpO1xuICAgIHN0YXRpYyBjb250ZW50ID0gYXR0cignc3RyaW5nJyk7XG4gIH0pO1xuICBsZXQgUG9zdCA9IGNvbnRhaW5lci5mYWN0b3J5Rm9yKCdtb2RlbDpwb3N0Jyk7XG4gIGxldCBzZXJpYWxpemVyID0gY29udGFpbmVyLmxvb2t1cCgnc2VyaWFsaXplcjpwb3N0Jyk7XG5cbiAgbGV0IHBvc3QgPSBhd2FpdCBQb3N0LmNyZWF0ZSh7IHRpdGxlOiAnZm9vJywgY29udGVudDogJ2JhcicgfSkuc2F2ZSgpO1xuICBsZXQgcmVzdWx0ID0gYXdhaXQgc2VyaWFsaXplci5zZXJpYWxpemUocG9zdCwgPGFueT57fSwge30pO1xuXG4gIHQuaXMocmVzdWx0LmRhdGEuYXR0cmlidXRlcy50aXRsZSwgJ2ZvbycpO1xuICB0LmZhbHN5KHJlc3VsdC5kYXRhLmF0dHJpYnV0ZXMuY29udGVudCk7XG59KTtcblxudGVzdCgnYWxsb3dzIHJlbmRlciBvcHRpb25zIHRvIG92ZXJyaWRlIGNsYXNzLWxldmVsIGF0dHJpYnV0ZXMgd2hpdGVsaXN0JywgYXN5bmMgKHQpID0+IHtcbiAgbGV0IGNvbnRhaW5lciA9IDxDb250YWluZXI+dC5jb250ZXh0LmNvbnRhaW5lcjtcbiAgY29udGFpbmVyLnJlZ2lzdGVyKCdzZXJpYWxpemVyOnBvc3QnLCBjbGFzcyBQb3N0U2VyaWFsaXplciBleHRlbmRzIEpTT05BUElTZXJpYWxpemVyIHtcbiAgICBhdHRyaWJ1dGVzID0gWyAndGl0bGUnIF07XG4gICAgcmVsYXRpb25zaGlwcyA9IHt9O1xuICB9KTtcbiAgY29udGFpbmVyLnJlZ2lzdGVyKCdtb2RlbDpwb3N0JywgY2xhc3MgUG9zdCBleHRlbmRzIE1vZGVsIHtcbiAgICBzdGF0aWMgdGl0bGUgPSBhdHRyKCdzdHJpbmcnKTtcbiAgICBzdGF0aWMgY29udGVudCA9IGF0dHIoJ3N0cmluZycpO1xuICB9KTtcbiAgbGV0IFBvc3QgPSBjb250YWluZXIuZmFjdG9yeUZvcignbW9kZWw6cG9zdCcpO1xuICBsZXQgc2VyaWFsaXplciA9IGNvbnRhaW5lci5sb29rdXAoJ3NlcmlhbGl6ZXI6cG9zdCcpO1xuXG4gIGxldCBwb3N0ID0gYXdhaXQgUG9zdC5jcmVhdGUoeyB0aXRsZTogJ2ZvbycsIGNvbnRlbnQ6ICdiYXInIH0pLnNhdmUoKTtcbiAgbGV0IHJlc3VsdCA9IGF3YWl0IHNlcmlhbGl6ZXIuc2VyaWFsaXplKHBvc3QsIDxhbnk+e30sIHsgYXR0cmlidXRlczogWyAnY29udGVudCcgXSB9KTtcblxuICB0LmlzKHJlc3VsdC5kYXRhLmF0dHJpYnV0ZXMuY29udGVudCwgJ2JhcicpO1xuICB0LmZhbHN5KHJlc3VsdC5kYXRhLmF0dHJpYnV0ZXMudGl0bGUpO1xufSk7XG5cbnRlc3QoJ29ubHkgcmVuZGVycyB3aGl0ZWxpc3RlZCByZWxhdGlvbnNoaXBzJywgYXN5bmMgKHQpID0+IHtcbiAgbGV0IGNvbnRhaW5lciA9IDxDb250YWluZXI+dC5jb250ZXh0LmNvbnRhaW5lcjtcbiAgY29udGFpbmVyLnJlZ2lzdGVyKCdzZXJpYWxpemVyOnBvc3QnLCBjbGFzcyBQb3N0U2VyaWFsaXplciBleHRlbmRzIEpTT05BUElTZXJpYWxpemVyIHtcbiAgICBhdHRyaWJ1dGVzID0gWyAndGl0bGUnIF07XG4gICAgcmVsYXRpb25zaGlwcyA9IHtcbiAgICAgIGNvbW1lbnRzOiB7XG4gICAgICAgIHN0cmF0ZWd5OiAnaWQnXG4gICAgICB9XG4gICAgfTtcbiAgfSk7XG4gIGNvbnRhaW5lci5yZWdpc3Rlcignc2VyaWFsaXplcjpjb21tZW50JywgY2xhc3MgQ29tbWVudFNlcmlhbGl6ZXIgZXh0ZW5kcyBKU09OQVBJU2VyaWFsaXplciB7XG4gICAgYXR0cmlidXRlcyA9IFsgJ3RleHQnIF07XG4gICAgcmVsYXRpb25zaGlwcyA9IHt9O1xuICB9KTtcbiAgY29udGFpbmVyLnJlZ2lzdGVyKCdtb2RlbDpwb3N0JywgY2xhc3MgUG9zdCBleHRlbmRzIE1vZGVsIHtcbiAgICBzdGF0aWMgdGl0bGUgPSBhdHRyKCdzdHJpbmcnKTtcbiAgICBzdGF0aWMgYXV0aG9yID0gaGFzT25lKCd1c2VyJyk7XG4gICAgc3RhdGljIGNvbW1lbnRzID0gaGFzTWFueSgnY29tbWVudCcpO1xuICB9KTtcbiAgY29udGFpbmVyLnJlZ2lzdGVyKCdtb2RlbDpjb21tZW50JywgY2xhc3MgQ29tbWVudCBleHRlbmRzIE1vZGVsIHtcbiAgICBzdGF0aWMgdGV4dCA9IGF0dHIoJ3N0cmluZycpO1xuICB9KTtcbiAgY29udGFpbmVyLnJlZ2lzdGVyKCdtb2RlbDp1c2VyJywgY2xhc3MgQ29tbWVudCBleHRlbmRzIE1vZGVsIHt9KTtcbiAgbGV0IFBvc3QgPSBjb250YWluZXIuZmFjdG9yeUZvcignbW9kZWw6cG9zdCcpO1xuICBsZXQgc2VyaWFsaXplciA9IGNvbnRhaW5lci5sb29rdXAoJ3NlcmlhbGl6ZXI6cG9zdCcpO1xuXG4gIGxldCBwb3N0ID0gYXdhaXQgUG9zdC5jcmVhdGUoeyB0aXRsZTogJ2ZvbycgfSkuc2F2ZSgpO1xuICBsZXQgcmVzdWx0ID0gYXdhaXQgc2VyaWFsaXplci5zZXJpYWxpemUocG9zdCwgPGFueT57fSwge30pO1xuXG4gIHQudHJ1ZShpc0FycmF5KHJlc3VsdC5kYXRhLnJlbGF0aW9uc2hpcHMuY29tbWVudHMuZGF0YSkpO1xuICB0LmZhbHN5KHJlc3VsdC5kYXRhLnJlbGF0aW9uc2hpcHMuYXV0aG9yKTtcbn0pO1xuXG50ZXN0KCdhbGxvd3MgcmVuZGVyIG9wdGlvbnMgdG8gb3ZlcnJpZGUgY2xhc3MtbGV2ZWwgcmVsYXRpb25zaGlwcyB3aGl0ZWxpc3QnLCBhc3luYyAodCkgPT4ge1xuICBsZXQgY29udGFpbmVyID0gPENvbnRhaW5lcj50LmNvbnRleHQuY29udGFpbmVyO1xuICBjb250YWluZXIucmVnaXN0ZXIoJ3NlcmlhbGl6ZXI6cG9zdCcsIGNsYXNzIFBvc3RTZXJpYWxpemVyIGV4dGVuZHMgSlNPTkFQSVNlcmlhbGl6ZXIge1xuICAgIGF0dHJpYnV0ZXMgPSBbICd0aXRsZScgXTtcbiAgICByZWxhdGlvbnNoaXBzID0ge1xuICAgICAgYXV0aG9yOiB7XG4gICAgICAgIHN0cmF0ZWd5OiAnaWQnXG4gICAgICB9XG4gICAgfTtcbiAgfSk7XG4gIGNvbnRhaW5lci5yZWdpc3Rlcignc2VyaWFsaXplcjpjb21tZW50cycsIGNsYXNzIENvbW1lbnRTZXJpYWxpemVyIGV4dGVuZHMgSlNPTkFQSVNlcmlhbGl6ZXIge1xuICAgIGF0dHJpYnV0ZXMgPSBbICd0aXRsZScgXTtcbiAgICByZWxhdGlvbnNoaXBzID0ge307XG4gIH0pO1xuICBjb250YWluZXIucmVnaXN0ZXIoJ21vZGVsOnBvc3QnLCBjbGFzcyBQb3N0IGV4dGVuZHMgTW9kZWwge1xuICAgIHN0YXRpYyB0aXRsZSA9IGF0dHIoJ3N0cmluZycpO1xuICAgIHN0YXRpYyBhdXRob3IgPSBoYXNPbmUoJ3VzZXInKTtcbiAgICBzdGF0aWMgY29tbWVudHMgPSBoYXNNYW55KCdjb21tZW50Jyk7XG4gIH0pO1xuICBjb250YWluZXIucmVnaXN0ZXIoJ21vZGVsOmNvbW1lbnQnLCBjbGFzcyBDb21tZW50IGV4dGVuZHMgTW9kZWwge1xuICAgIHN0YXRpYyB0ZXh0ID0gYXR0cignc3RyaW5nJyk7XG4gIH0pO1xuICBjb250YWluZXIucmVnaXN0ZXIoJ21vZGVsOnVzZXInLCBjbGFzcyBDb21tZW50IGV4dGVuZHMgTW9kZWwge30pO1xuICBsZXQgUG9zdCA9IGNvbnRhaW5lci5mYWN0b3J5Rm9yKCdtb2RlbDpwb3N0Jyk7XG4gIGxldCBzZXJpYWxpemVyID0gY29udGFpbmVyLmxvb2t1cCgnc2VyaWFsaXplcjpwb3N0Jyk7XG5cbiAgbGV0IHBvc3QgPSBhd2FpdCBQb3N0LmNyZWF0ZSh7IHRpdGxlOiAnZm9vJyB9KS5zYXZlKCk7XG4gIGxldCByZXN1bHQgPSBhd2FpdCBzZXJpYWxpemVyLnNlcmlhbGl6ZShwb3N0LCA8YW55Pnt9LCB7XG4gICAgcmVsYXRpb25zaGlwczoge1xuICAgICAgY29tbWVudHM6IHtcbiAgICAgICAgc3RyYXRlZ3k6ICdpZCdcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIHQudHJ1ZShpc0FycmF5KHJlc3VsdC5kYXRhLnJlbGF0aW9uc2hpcHMuY29tbWVudHMuZGF0YSkpO1xuICB0LmZhbHN5KHJlc3VsdC5kYXRhLnJlbGF0aW9uc2hpcHMuYXV0aG9yKTtcbn0pO1xuXG50ZXN0KCd1c2VzIHJlbGF0ZWQgc2VyaWFsaXplcnMgdG8gcmVuZGVyIHJlbGF0ZWQgcmVjb3JkcycsIGFzeW5jICh0KSA9PiB7XG4gIGxldCBjb250YWluZXIgPSA8Q29udGFpbmVyPnQuY29udGV4dC5jb250YWluZXI7XG4gIGNvbnRhaW5lci5yZWdpc3Rlcignc2VyaWFsaXplcjpwb3N0JywgY2xhc3MgUG9zdFNlcmlhbGl6ZXIgZXh0ZW5kcyBKU09OQVBJU2VyaWFsaXplciB7XG4gICAgYXR0cmlidXRlcyA9IFsgJ3RpdGxlJyBdO1xuICAgIHJlbGF0aW9uc2hpcHMgPSB7XG4gICAgICBjb21tZW50czoge1xuICAgICAgICBzdHJhdGVneTogJ2VtYmVkJ1xuICAgICAgfVxuICAgIH07XG4gIH0pO1xuICBjb250YWluZXIucmVnaXN0ZXIoJ3NlcmlhbGl6ZXI6Y29tbWVudCcsIGNsYXNzIENvbW1lbnRTZXJpYWxpemVyIGV4dGVuZHMgSlNPTkFQSVNlcmlhbGl6ZXIge1xuICAgIGF0dHJpYnV0ZXMgPSBbICd0ZXh0JyBdO1xuICAgIHJlbGF0aW9uc2hpcHMgPSB7fTtcbiAgfSk7XG4gIGNvbnRhaW5lci5yZWdpc3RlcignbW9kZWw6cG9zdCcsIGNsYXNzIFBvc3QgZXh0ZW5kcyBNb2RlbCB7XG4gICAgc3RhdGljIHRpdGxlID0gYXR0cignc3RyaW5nJyk7XG4gICAgc3RhdGljIGNvbW1lbnRzID0gaGFzTWFueSgnY29tbWVudCcpO1xuICB9KTtcbiAgY29udGFpbmVyLnJlZ2lzdGVyKCdtb2RlbDpjb21tZW50JywgY2xhc3MgQ29tbWVudCBleHRlbmRzIE1vZGVsIHtcbiAgICBzdGF0aWMgdGV4dCA9IGF0dHIoJ3N0cmluZycpO1xuICAgIHN0YXRpYyBwdWJsaXNoZWRBdCA9IGF0dHIoJ3N0cmluZycpO1xuICB9KTtcbiAgbGV0IFBvc3QgPSBjb250YWluZXIuZmFjdG9yeUZvcignbW9kZWw6cG9zdCcpO1xuICBsZXQgQ29tbWVudCA9IGNvbnRhaW5lci5mYWN0b3J5Rm9yKCdtb2RlbDpjb21tZW50Jyk7XG4gIGxldCBzZXJpYWxpemVyID0gY29udGFpbmVyLmxvb2t1cCgnc2VyaWFsaXplcjpwb3N0Jyk7XG5cbiAgbGV0IHBvc3QgPSBhd2FpdCBQb3N0LmNyZWF0ZSh7IHRpdGxlOiAnZm9vJyB9KS5zYXZlKCk7XG4gIGF3YWl0IHBvc3QuYWRkQ29tbWVudChhd2FpdCBDb21tZW50LmNyZWF0ZSh7IHRleHQ6ICdiYXInLCBwdWJsaXNoZWRBdDogJ2ZpenonIH0pLnNhdmUoKSk7XG4gIGxldCByZXN1bHQgPSBhd2FpdCBzZXJpYWxpemVyLnNlcmlhbGl6ZShwb3N0LCA8YW55Pnt9LCB7fSk7XG5cbiAgdC50cnVlKGlzQXJyYXkocmVzdWx0LmluY2x1ZGVkKSk7XG4gIHQuaXMocmVzdWx0LmluY2x1ZGVkWzBdLmF0dHJpYnV0ZXMudGV4dCwgJ2JhcicpO1xuICB0LmZhbHN5KHJlc3VsdC5pbmNsdWRlZFswXS5hdHRyaWJ1dGVzLnB1Ymxpc2hlZEF0KTtcbn0pO1xuXG50ZXN0LnRvZG8oJ3JlbmRlcnMgcmVzb3VyY2Ugb2JqZWN0IG1ldGEnKTtcblxudGVzdC50b2RvKCdyZW5kZXJzIHJlc291cmNlIG9iamVjdCBsaW5rcycpO1xuXG50ZXN0KCdkYXNoZXJpemVzIGZpZWxkIG5hbWVzJywgYXN5bmMgKHQpID0+IHtcbiAgbGV0IGNvbnRhaW5lciA9IDxDb250YWluZXI+dC5jb250ZXh0LmNvbnRhaW5lcjtcbiAgY29udGFpbmVyLnJlZ2lzdGVyKCdzZXJpYWxpemVyOnBvc3QnLCBjbGFzcyBUZXN0U2VyaWFsaXplciBleHRlbmRzIEpTT05BUElTZXJpYWxpemVyIHtcbiAgICBhdHRyaWJ1dGVzID0gWyAncHVibGlzaGVkQXQnIF07XG4gICAgcmVsYXRpb25zaGlwcyA9IHt9O1xuICB9KTtcbiAgY29udGFpbmVyLnJlZ2lzdGVyKCdtb2RlbDpwb3N0JywgY2xhc3MgUG9zdCBleHRlbmRzIE1vZGVsIHtcbiAgICBzdGF0aWMgcHVibGlzaGVkQXQgPSBhdHRyKCdzdHJpbmcnKTtcbiAgfSk7XG4gIGxldCBkYiA9IGNvbnRhaW5lci5sb29rdXAoJ3NlcnZpY2U6ZGInKTtcbiAgbGV0IHNlcmlhbGl6ZXIgPSBjb250YWluZXIubG9va3VwKCdzZXJpYWxpemVyOnBvc3QnKTtcblxuICBsZXQgcG9zdCA9IGF3YWl0IGRiLmNyZWF0ZSgncG9zdCcsIHsgcHVibGlzaGVkQXQ6ICdmb28nIH0pLnNhdmUoKTtcbiAgbGV0IHJlc3VsdCA9IGF3YWl0IHNlcmlhbGl6ZXIuc2VyaWFsaXplKHBvc3QsIDxhbnk+e30sIHt9KTtcblxuICB0LmlzKHJlc3VsdC5kYXRhLmF0dHJpYnV0ZXNbJ3B1Ymxpc2hlZC1hdCddLCAnZm9vJyk7XG59KTtcblxudGVzdC50b2RvKCdyZW5kZXJzIHJlbGF0aW9uc2hpcCBtZXRhJyk7XG5cbnRlc3QudG9kbygncmVuZGVycyByZWxhdGlvbnNoaXAgbGlua3MnKTtcbiJdfQ==