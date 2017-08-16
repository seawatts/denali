"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
/* tslint:disable:completed-docs no-empty no-invalid-this member-access */
const ava_1 = require("ava");
const lodash_1 = require("lodash");
const denali_1 = require("denali");
ava_1.default.beforeEach((t) => {
    t.context.container = new denali_1.Container(__dirname);
    t.context.container.register('orm-adapter:application', denali_1.MemoryAdapter);
});
ava_1.default('renders models as flat json structures', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let container = t.context.container;
    container.register('serializer:application', class TestSerializer extends denali_1.FlatSerializer {
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
    let serializer = container.lookup('serializer:application');
    let Post = container.factoryFor('model:post');
    let post = yield Post.create({ title: 'foo' }).save();
    let result = yield serializer.serialize(post, {}, {});
    t.is(result.title, 'foo');
    var _a;
}));
ava_1.default('renders related records as embedded objects', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let container = t.context.container;
    container.register('serializer:post', class PostSerializer extends denali_1.FlatSerializer {
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
    container.register('serializer:comment', class CommentSerializer extends denali_1.FlatSerializer {
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
    yield post.addComment(yield Comment.create({ text: 'bar' }).save());
    let result = yield serializer.serialize(post, {}, {});
    t.true(lodash_1.isArray(result.comments));
    t.is(result.comments[0].text, 'bar');
    var _a, _b;
}));
ava_1.default('renders related records as embedded ids', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let container = t.context.container;
    container.register('serializer:post', class PostSerializer extends denali_1.FlatSerializer {
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
    container.register('serializer:comment', class CommentSerializer extends denali_1.FlatSerializer {
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
    t.true(lodash_1.isArray(result.comments));
    t.is(result.comments[0], comment.id);
    var _a, _b;
}));
ava_1.default('renders errors', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let container = t.context.container;
    container.register('serializer:application', class PostSerializer extends denali_1.FlatSerializer {
        constructor() {
            super(...arguments);
            this.attributes = [];
            this.relationships = {};
        }
    });
    let serializer = container.lookup('serializer:application');
    let result = yield serializer.serialize(new denali_1.Errors.InternalServerError('foo'), {}, {});
    t.is(result.status, 500);
    t.is(result.code, 'InternalServerError');
    t.is(result.message, 'foo');
}));
ava_1.default('only renders whitelisted attributes', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let container = t.context.container;
    container.register('serializer:post', class PostSerializer extends denali_1.FlatSerializer {
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
    t.is(result.title, 'foo');
    t.falsy(result.content);
    var _a;
}));
ava_1.default('only renders whitelisted relationships', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let container = t.context.container;
    container.register('serializer:post', class PostSerializer extends denali_1.FlatSerializer {
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
    container.register('serializer:comment', class CommentSerializer extends denali_1.FlatSerializer {
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
    t.true(lodash_1.isArray(result.comments));
    t.falsy(result.author);
    var _a, _b;
}));
ava_1.default('uses related serializers to render related records', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let container = t.context.container;
    container.register('serializer:post', class PostSerializer extends denali_1.FlatSerializer {
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
    container.register('serializer:comment', class CommentSerializer extends denali_1.FlatSerializer {
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
    t.true(lodash_1.isArray(result.comments));
    t.is(result.comments[0].text, 'bar');
    t.falsy(result.comments[0].publishedAt);
    var _a, _b;
}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmxhdC10ZXN0LmpzIiwic291cmNlUm9vdCI6Ii9Vc2Vycy9zZWF3YXR0cy9zcmMvZ2l0aHViLmNvbS9zZWF3YXR0cy9kZW5hbGkvIiwic291cmNlcyI6WyJ0ZXN0L3VuaXQvcmVuZGVyL2ZsYXQtdGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwwRUFBMEU7QUFDMUUsNkJBQXVCO0FBQ3ZCLG1DQUFpQztBQUNqQyxtQ0FBd0c7QUFFeEcsYUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7SUFDaEIsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxTQUFTLEdBQUcsSUFBSSxrQkFBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQy9DLENBQUMsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyx5QkFBeUIsRUFBRSxzQkFBYSxDQUFDLENBQUM7QUFDekUsQ0FBQyxDQUFDLENBQUM7QUFFSCxhQUFJLENBQUMsd0NBQXdDLEVBQUUsQ0FBTyxDQUFDO0lBQ3JELElBQUksU0FBUyxHQUFjLENBQUMsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDO0lBQy9DLFNBQVMsQ0FBQyxRQUFRLENBQUMsd0JBQXdCLEVBQUUsb0JBQXFCLFNBQVEsdUJBQWM7UUFBM0M7O1lBQzNDLGVBQVUsR0FBRyxDQUFFLE9BQU8sQ0FBRSxDQUFDO1lBQ3pCLGtCQUFhLEdBQUcsRUFBRSxDQUFDO1FBQ3JCLENBQUM7S0FBQSxDQUFDLENBQUM7SUFDSCxTQUFTLENBQUMsUUFBUSxDQUFDLFlBQVksUUFBRSxVQUFXLFNBQVEsY0FBSztTQUV4RDtRQURRLFFBQUssR0FBRyxhQUFJLENBQUMsUUFBUSxDQUFFO1lBQzlCLENBQUM7SUFDSCxJQUFJLFVBQVUsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLHdCQUF3QixDQUFDLENBQUM7SUFDNUQsSUFBSSxJQUFJLEdBQUcsU0FBUyxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUM5QyxJQUFJLElBQUksR0FBRyxNQUFNLElB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LENBQUM7SUFDOUMsSUFBSSxPQUFPLEdBQUcsU0FBUyxDQUFDLFVBQVUsQ0FBQyxlQUFlLENBQUMsQ0FBQztJQUNwRCxJQUFJLFVBQVUsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLENBQUM7SUFFckQsSUFBSSxJQUFJLEdBQUcsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDdEQsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztJQUN6RixJQUFJLE1BQU0sR0FBRyxNQUFNLFVBQVUsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFPLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUUzRCxDQUFDLENBQUMsSUFBSSxDQUFDLGdCQUFPLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7SUFDakMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztJQUNyQyxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUM7O0FBQzFDLENBQUMsQ0FBQSxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiB0c2xpbnQ6ZGlzYWJsZTpjb21wbGV0ZWQtZG9jcyBuby1lbXB0eSBuby1pbnZhbGlkLXRoaXMgbWVtYmVyLWFjY2VzcyAqL1xuaW1wb3J0IHRlc3QgZnJvbSAnYXZhJztcbmltcG9ydCB7IGlzQXJyYXkgfSBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IHsgRmxhdFNlcmlhbGl6ZXIsIE1vZGVsLCBhdHRyLCBDb250YWluZXIsIE1lbW9yeUFkYXB0ZXIsIGhhc01hbnksIEVycm9ycywgaGFzT25lIH0gZnJvbSAnZGVuYWxpJztcblxudGVzdC5iZWZvcmVFYWNoKCh0KSA9PiB7XG4gIHQuY29udGV4dC5jb250YWluZXIgPSBuZXcgQ29udGFpbmVyKF9fZGlybmFtZSk7XG4gIHQuY29udGV4dC5jb250YWluZXIucmVnaXN0ZXIoJ29ybS1hZGFwdGVyOmFwcGxpY2F0aW9uJywgTWVtb3J5QWRhcHRlcik7XG59KTtcblxudGVzdCgncmVuZGVycyBtb2RlbHMgYXMgZmxhdCBqc29uIHN0cnVjdHVyZXMnLCBhc3luYyAodCkgPT4ge1xuICBsZXQgY29udGFpbmVyID0gPENvbnRhaW5lcj50LmNvbnRleHQuY29udGFpbmVyO1xuICBjb250YWluZXIucmVnaXN0ZXIoJ3NlcmlhbGl6ZXI6YXBwbGljYXRpb24nLCBjbGFzcyBUZXN0U2VyaWFsaXplciBleHRlbmRzIEZsYXRTZXJpYWxpemVyIHtcbiAgICBhdHRyaWJ1dGVzID0gWyAndGl0bGUnIF07XG4gICAgcmVsYXRpb25zaGlwcyA9IHt9O1xuICB9KTtcbiAgY29udGFpbmVyLnJlZ2lzdGVyKCdtb2RlbDpwb3N0JywgY2xhc3MgUG9zdCBleHRlbmRzIE1vZGVsIHtcbiAgICBzdGF0aWMgdGl0bGUgPSBhdHRyKCdzdHJpbmcnKTtcbiAgfSk7XG4gIGxldCBzZXJpYWxpemVyID0gY29udGFpbmVyLmxvb2t1cCgnc2VyaWFsaXplcjphcHBsaWNhdGlvbicpO1xuICBsZXQgUG9zdCA9IGNvbnRhaW5lci5mYWN0b3J5Rm9yKCdtb2RlbDpwb3N0Jyk7XG4gIGxldCBwb3N0ID0gYXdhaXQgUG9zdC5jcmVhdGUoeyB0aXRsZTogJ2ZvbycgfSkuc2F2ZSgpO1xuICBsZXQgcmVzdWx0ID0gYXdhaXQgc2VyaWFsaXplci5zZXJpYWxpemUocG9zdCwgPGFueT57fSwge30pO1xuXG4gIHQuaXMocmVzdWx0LnRpdGxlLCAnZm9vJyk7XG59KTtcblxudGVzdCgncmVuZGVycyByZWxhdGVkIHJlY29yZHMgYXMgZW1iZWRkZWQgb2JqZWN0cycsIGFzeW5jICh0KSA9PiB7XG4gIGxldCBjb250YWluZXIgPSA8Q29udGFpbmVyPnQuY29udGV4dC5jb250YWluZXI7XG4gIGNvbnRhaW5lci5yZWdpc3Rlcignc2VyaWFsaXplcjpwb3N0JywgY2xhc3MgUG9zdFNlcmlhbGl6ZXIgZXh0ZW5kcyBGbGF0U2VyaWFsaXplciB7XG4gICAgYXR0cmlidXRlcyA9IFsgJ3RpdGxlJyBdO1xuICAgIHJlbGF0aW9uc2hpcHMgPSB7XG4gICAgICBjb21tZW50czoge1xuICAgICAgICBzdHJhdGVneTogJ2VtYmVkJ1xuICAgICAgfVxuICAgIH07XG4gIH0pO1xuICBjb250YWluZXIucmVnaXN0ZXIoJ3NlcmlhbGl6ZXI6Y29tbWVudCcsIGNsYXNzIENvbW1lbnRTZXJpYWxpemVyIGV4dGVuZHMgRmxhdFNlcmlhbGl6ZXIge1xuICAgIGF0dHJpYnV0ZXMgPSBbICd0ZXh0JyBdO1xuICAgIHJlbGF0aW9uc2hpcHMgPSB7fTtcbiAgfSk7XG4gIGNvbnRhaW5lci5yZWdpc3RlcignbW9kZWw6cG9zdCcsIGNsYXNzIFBvc3QgZXh0ZW5kcyBNb2RlbCB7XG4gICAgc3RhdGljIHRpdGxlID0gYXR0cignc3RyaW5nJyk7XG4gICAgc3RhdGljIGNvbW1lbnRzID0gaGFzTWFueSgnY29tbWVudCcpO1xuICB9KTtcbiAgY29udGFpbmVyLnJlZ2lzdGVyKCdtb2RlbDpjb21tZW50JywgY2xhc3MgQ29tbWVudCBleHRlbmRzIE1vZGVsIHtcbiAgICBzdGF0aWMgdGV4dCA9IGF0dHIoJ3N0cmluZycpO1xuICB9KTtcbiAgbGV0IFBvc3QgPSBjb250YWluZXIuZmFjdG9yeUZvcignbW9kZWw6cG9zdCcpO1xuICBsZXQgQ29tbWVudCA9IGNvbnRhaW5lci5mYWN0b3J5Rm9yKCdtb2RlbDpjb21tZW50Jyk7XG4gIGxldCBzZXJpYWxpemVyID0gY29udGFpbmVyLmxvb2t1cCgnc2VyaWFsaXplcjpwb3N0Jyk7XG5cbiAgbGV0IHBvc3QgPSBhd2FpdCBQb3N0LmNyZWF0ZSh7IHRpdGxlOiAnZm9vJyB9KS5zYXZlKCk7XG4gIGF3YWl0IHBvc3QuYWRkQ29tbWVudChhd2FpdCBDb21tZW50LmNyZWF0ZSh7IHRleHQ6ICdiYXInIH0pLnNhdmUoKSk7XG4gIGxldCByZXN1bHQgPSBhd2FpdCBzZXJpYWxpemVyLnNlcmlhbGl6ZShwb3N0LCA8YW55Pnt9LCB7fSk7XG5cbiAgdC50cnVlKGlzQXJyYXkocmVzdWx0LmNvbW1lbnRzKSk7XG4gIHQuaXMocmVzdWx0LmNvbW1lbnRzWzBdLnRleHQsICdiYXInKTtcbn0pO1xuXG50ZXN0KCdyZW5kZXJzIHJlbGF0ZWQgcmVjb3JkcyBhcyBlbWJlZGRlZCBpZHMnLCBhc3luYyAodCkgPT4ge1xuICBsZXQgY29udGFpbmVyID0gPENvbnRhaW5lcj50LmNvbnRleHQuY29udGFpbmVyO1xuICBjb250YWluZXIucmVnaXN0ZXIoJ3NlcmlhbGl6ZXI6cG9zdCcsIGNsYXNzIFBvc3RTZXJpYWxpemVyIGV4dGVuZHMgRmxhdFNlcmlhbGl6ZXIge1xuICAgIGF0dHJpYnV0ZXMgPSBbICd0aXRsZScgXTtcbiAgICByZWxhdGlvbnNoaXBzID0ge1xuICAgICAgY29tbWVudHM6IHtcbiAgICAgICAgc3RyYXRlZ3k6ICdpZCdcbiAgICAgIH1cbiAgICB9O1xuICB9KTtcbiAgY29udGFpbmVyLnJlZ2lzdGVyKCdzZXJpYWxpemVyOmNvbW1lbnQnLCBjbGFzcyBDb21tZW50U2VyaWFsaXplciBleHRlbmRzIEZsYXRTZXJpYWxpemVyIHtcbiAgICBhdHRyaWJ1dGVzID0gWyAndGV4dCcgXTtcbiAgICByZWxhdGlvbnNoaXBzID0ge307XG4gIH0pO1xuICBjb250YWluZXIucmVnaXN0ZXIoJ21vZGVsOnBvc3QnLCBjbGFzcyBQb3N0IGV4dGVuZHMgTW9kZWwge1xuICAgIHN0YXRpYyB0aXRsZSA9IGF0dHIoJ3N0cmluZycpO1xuICAgIHN0YXRpYyBjb21tZW50cyA9IGhhc01hbnkoJ2NvbW1lbnQnKTtcbiAgfSk7XG4gIGNvbnRhaW5lci5yZWdpc3RlcignbW9kZWw6Y29tbWVudCcsIGNsYXNzIENvbW1lbnQgZXh0ZW5kcyBNb2RlbCB7XG4gICAgc3RhdGljIHRleHQgPSBhdHRyKCdzdHJpbmcnKTtcbiAgfSk7XG4gIGxldCBQb3N0ID0gY29udGFpbmVyLmZhY3RvcnlGb3IoJ21vZGVsOnBvc3QnKTtcbiAgbGV0IENvbW1lbnQgPSBjb250YWluZXIuZmFjdG9yeUZvcignbW9kZWw6Y29tbWVudCcpO1xuICBsZXQgc2VyaWFsaXplciA9IGNvbnRhaW5lci5sb29rdXAoJ3NlcmlhbGl6ZXI6cG9zdCcpO1xuXG4gIGxldCBwb3N0ID0gYXdhaXQgUG9zdC5jcmVhdGUoeyB0aXRsZTogJ2ZvbycgfSkuc2F2ZSgpO1xuICBsZXQgY29tbWVudCA9IGF3YWl0IENvbW1lbnQuY3JlYXRlKHsgdGV4dDogJ2JhcicgfSkuc2F2ZSgpO1xuICBhd2FpdCBwb3N0LmFkZENvbW1lbnQoY29tbWVudCk7XG4gIGxldCByZXN1bHQgPSBhd2FpdCBzZXJpYWxpemVyLnNlcmlhbGl6ZShwb3N0LCA8YW55Pnt9LCB7fSk7XG5cbiAgdC50cnVlKGlzQXJyYXkocmVzdWx0LmNvbW1lbnRzKSk7XG4gIHQuaXMocmVzdWx0LmNvbW1lbnRzWzBdLCBjb21tZW50LmlkKTtcbn0pO1xuXG50ZXN0KCdyZW5kZXJzIGVycm9ycycsIGFzeW5jICh0KSA9PiB7XG4gIGxldCBjb250YWluZXIgPSA8Q29udGFpbmVyPnQuY29udGV4dC5jb250YWluZXI7XG4gIGNvbnRhaW5lci5yZWdpc3Rlcignc2VyaWFsaXplcjphcHBsaWNhdGlvbicsIGNsYXNzIFBvc3RTZXJpYWxpemVyIGV4dGVuZHMgRmxhdFNlcmlhbGl6ZXIge1xuICAgIGF0dHJpYnV0ZXM6IHN0cmluZ1tdID0gW107XG4gICAgcmVsYXRpb25zaGlwcyA9IHt9O1xuICB9KTtcbiAgbGV0IHNlcmlhbGl6ZXIgPSBjb250YWluZXIubG9va3VwKCdzZXJpYWxpemVyOmFwcGxpY2F0aW9uJyk7XG5cbiAgbGV0IHJlc3VsdCA9IGF3YWl0IHNlcmlhbGl6ZXIuc2VyaWFsaXplKG5ldyBFcnJvcnMuSW50ZXJuYWxTZXJ2ZXJFcnJvcignZm9vJyksIDxhbnk+e30sIHt9KTtcbiAgdC5pcyhyZXN1bHQuc3RhdHVzLCA1MDApO1xuICB0LmlzKHJlc3VsdC5jb2RlLCAnSW50ZXJuYWxTZXJ2ZXJFcnJvcicpO1xuICB0LmlzKHJlc3VsdC5tZXNzYWdlLCAnZm9vJyk7XG59KTtcblxudGVzdCgnb25seSByZW5kZXJzIHdoaXRlbGlzdGVkIGF0dHJpYnV0ZXMnLCBhc3luYyAodCkgPT4ge1xuICBsZXQgY29udGFpbmVyID0gPENvbnRhaW5lcj50LmNvbnRleHQuY29udGFpbmVyO1xuICBjb250YWluZXIucmVnaXN0ZXIoJ3NlcmlhbGl6ZXI6cG9zdCcsIGNsYXNzIFBvc3RTZXJpYWxpemVyIGV4dGVuZHMgRmxhdFNlcmlhbGl6ZXIge1xuICAgIGF0dHJpYnV0ZXMgPSBbICd0aXRsZScgXTtcbiAgICByZWxhdGlvbnNoaXBzID0ge307XG4gIH0pO1xuICBjb250YWluZXIucmVnaXN0ZXIoJ21vZGVsOnBvc3QnLCBjbGFzcyBQb3N0IGV4dGVuZHMgTW9kZWwge1xuICAgIHN0YXRpYyB0aXRsZSA9IGF0dHIoJ3N0cmluZycpO1xuICAgIHN0YXRpYyBjb250ZW50ID0gYXR0cignc3RyaW5nJyk7XG4gIH0pO1xuICBsZXQgUG9zdCA9IGNvbnRhaW5lci5mYWN0b3J5Rm9yKCdtb2RlbDpwb3N0Jyk7XG4gIGxldCBzZXJpYWxpemVyID0gY29udGFpbmVyLmxvb2t1cCgnc2VyaWFsaXplcjpwb3N0Jyk7XG5cbiAgbGV0IHBvc3QgPSBhd2FpdCBQb3N0LmNyZWF0ZSh7IHRpdGxlOiAnZm9vJywgY29udGVudDogJ2JhcicgfSkuc2F2ZSgpO1xuICBsZXQgcmVzdWx0ID0gYXdhaXQgc2VyaWFsaXplci5zZXJpYWxpemUocG9zdCwgPGFueT57fSwge30pO1xuXG4gIHQuaXMocmVzdWx0LnRpdGxlLCAnZm9vJyk7XG4gIHQuZmFsc3kocmVzdWx0LmNvbnRlbnQpO1xufSk7XG5cbnRlc3QoJ29ubHkgcmVuZGVycyB3aGl0ZWxpc3RlZCByZWxhdGlvbnNoaXBzJywgYXN5bmMgKHQpID0+IHtcbiAgbGV0IGNvbnRhaW5lciA9IDxDb250YWluZXI+dC5jb250ZXh0LmNvbnRhaW5lcjtcbiAgY29udGFpbmVyLnJlZ2lzdGVyKCdzZXJpYWxpemVyOnBvc3QnLCBjbGFzcyBQb3N0U2VyaWFsaXplciBleHRlbmRzIEZsYXRTZXJpYWxpemVyIHtcbiAgICBhdHRyaWJ1dGVzID0gWyAndGl0bGUnIF07XG4gICAgcmVsYXRpb25zaGlwcyA9IHtcbiAgICAgIGNvbW1lbnRzOiB7XG4gICAgICAgIHN0cmF0ZWd5OiAnaWQnXG4gICAgICB9XG4gICAgfTtcbiAgfSk7XG4gIGNvbnRhaW5lci5yZWdpc3Rlcignc2VyaWFsaXplcjpjb21tZW50JywgY2xhc3MgQ29tbWVudFNlcmlhbGl6ZXIgZXh0ZW5kcyBGbGF0U2VyaWFsaXplciB7XG4gICAgYXR0cmlidXRlcyA9IFsgJ3RleHQnIF07XG4gICAgcmVsYXRpb25zaGlwcyA9IHt9O1xuICB9KTtcbiAgY29udGFpbmVyLnJlZ2lzdGVyKCdtb2RlbDpwb3N0JywgY2xhc3MgUG9zdCBleHRlbmRzIE1vZGVsIHtcbiAgICBzdGF0aWMgdGl0bGUgPSBhdHRyKCdzdHJpbmcnKTtcbiAgICBzdGF0aWMgYXV0aG9yID0gaGFzT25lKCd1c2VyJyk7XG4gICAgc3RhdGljIGNvbW1lbnRzID0gaGFzTWFueSgnY29tbWVudCcpO1xuICB9KTtcbiAgY29udGFpbmVyLnJlZ2lzdGVyKCdtb2RlbDpjb21tZW50JywgY2xhc3MgQ29tbWVudCBleHRlbmRzIE1vZGVsIHtcbiAgICBzdGF0aWMgdGV4dCA9IGF0dHIoJ3N0cmluZycpO1xuICB9KTtcbiAgY29udGFpbmVyLnJlZ2lzdGVyKCdtb2RlbDp1c2VyJywgY2xhc3MgQ29tbWVudCBleHRlbmRzIE1vZGVsIHt9KTtcbiAgbGV0IFBvc3QgPSBjb250YWluZXIuZmFjdG9yeUZvcignbW9kZWw6cG9zdCcpO1xuICBsZXQgc2VyaWFsaXplciA9IGNvbnRhaW5lci5sb29rdXAoJ3NlcmlhbGl6ZXI6cG9zdCcpO1xuXG4gIGxldCBwb3N0ID0gYXdhaXQgUG9zdC5jcmVhdGUoeyB0aXRsZTogJ2ZvbycgfSkuc2F2ZSgpO1xuICBsZXQgcmVzdWx0ID0gYXdhaXQgc2VyaWFsaXplci5zZXJpYWxpemUocG9zdCwgPGFueT57fSwge30pO1xuXG4gIHQudHJ1ZShpc0FycmF5KHJlc3VsdC5jb21tZW50cykpO1xuICB0LmZhbHN5KHJlc3VsdC5hdXRob3IpO1xufSk7XG5cbnRlc3QoJ3VzZXMgcmVsYXRlZCBzZXJpYWxpemVycyB0byByZW5kZXIgcmVsYXRlZCByZWNvcmRzJywgYXN5bmMgKHQpID0+IHtcbiAgbGV0IGNvbnRhaW5lciA9IDxDb250YWluZXI+dC5jb250ZXh0LmNvbnRhaW5lcjtcbiAgY29udGFpbmVyLnJlZ2lzdGVyKCdzZXJpYWxpemVyOnBvc3QnLCBjbGFzcyBQb3N0U2VyaWFsaXplciBleHRlbmRzIEZsYXRTZXJpYWxpemVyIHtcbiAgICBhdHRyaWJ1dGVzID0gWyAndGl0bGUnIF07XG4gICAgcmVsYXRpb25zaGlwcyA9IHtcbiAgICAgIGNvbW1lbnRzOiB7XG4gICAgICAgIHN0cmF0ZWd5OiAnZW1iZWQnXG4gICAgICB9XG4gICAgfTtcbiAgfSk7XG4gIGNvbnRhaW5lci5yZWdpc3Rlcignc2VyaWFsaXplcjpjb21tZW50JywgY2xhc3MgQ29tbWVudFNlcmlhbGl6ZXIgZXh0ZW5kcyBGbGF0U2VyaWFsaXplciB7XG4gICAgYXR0cmlidXRlcyA9IFsgJ3RleHQnIF07XG4gICAgcmVsYXRpb25zaGlwcyA9IHt9O1xuICB9KTtcbiAgY29udGFpbmVyLnJlZ2lzdGVyKCdtb2RlbDpwb3N0JywgY2xhc3MgUG9zdCBleHRlbmRzIE1vZGVsIHtcbiAgICBzdGF0aWMgdGl0bGUgPSBhdHRyKCdzdHJpbmcnKTtcbiAgICBzdGF0aWMgY29tbWVudHMgPSBoYXNNYW55KCdjb21tZW50Jyk7XG4gIH0pO1xuICBjb250YWluZXIucmVnaXN0ZXIoJ21vZGVsOmNvbW1lbnQnLCBjbGFzcyBDb21tZW50IGV4dGVuZHMgTW9kZWwge1xuICAgIHN0YXRpYyB0ZXh0ID0gYXR0cignc3RyaW5nJyk7XG4gICAgc3RhdGljIHB1Ymxpc2hlZEF0ID0gYXR0cignc3RyaW5nJyk7XG4gIH0pO1xuICBsZXQgUG9zdCA9IGNvbnRhaW5lci5mYWN0b3J5Rm9yKCdtb2RlbDpwb3N0Jyk7XG4gIGxldCBDb21tZW50ID0gY29udGFpbmVyLmZhY3RvcnlGb3IoJ21vZGVsOmNvbW1lbnQnKTtcbiAgbGV0IHNlcmlhbGl6ZXIgPSBjb250YWluZXIubG9va3VwKCdzZXJpYWxpemVyOnBvc3QnKTtcblxuICBsZXQgcG9zdCA9IGF3YWl0IFBvc3QuY3JlYXRlKHsgdGl0bGU6ICdmb28nIH0pLnNhdmUoKTtcbiAgYXdhaXQgcG9zdC5hZGRDb21tZW50KGF3YWl0IENvbW1lbnQuY3JlYXRlKHsgdGV4dDogJ2JhcicsIHB1Ymxpc2hlZEF0OiAnZml6eicgfSkuc2F2ZSgpKTtcbiAgbGV0IHJlc3VsdCA9IGF3YWl0IHNlcmlhbGl6ZXIuc2VyaWFsaXplKHBvc3QsIDxhbnk+e30sIHt9KTtcblxuICB0LnRydWUoaXNBcnJheShyZXN1bHQuY29tbWVudHMpKTtcbiAgdC5pcyhyZXN1bHQuY29tbWVudHNbMF0udGV4dCwgJ2JhcicpO1xuICB0LmZhbHN5KHJlc3VsdC5jb21tZW50c1swXS5wdWJsaXNoZWRBdCk7XG59KTtcbiJdfQ==