"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
/* tslint:disable:completed-docs no-empty no-invalid-this member-access */
const ava_1 = require("ava");
const denali_1 = require("denali");
function mockRequest(body) {
    let mocked = new denali_1.MockRequest({
        method: 'POST',
        headers: {
            'Content-type': 'application/vnd.api+json'
        }
    });
    let req = new denali_1.Request(mocked);
    req.body = body;
    return req;
}
ava_1.default('returns responder params with primary request data flattened', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let parser = new denali_1.JSONAPIParser();
    let result = parser.parse(mockRequest({
        data: {
            type: 'bar',
            attributes: {
                foo: true
            }
        }
    }));
    t.true(result.body.foo);
}));
ava_1.default('returns responder params with included records', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let parser = new denali_1.JSONAPIParser();
    let result = parser.parse(mockRequest({
        data: {
            type: 'bar',
            attributes: {
                foo: true
            }
        },
        included: [
            {
                type: 'fizz',
                attributes: {
                    buzz: true
                }
            }
        ]
    }));
    t.true(result.body.foo);
    t.true(result.included[0].buzz);
}));
ava_1.default('doesn\'t attempt to parse and returns no body if request body empty', (t) => {
    let parser = new denali_1.JSONAPIParser();
    let mocked = new denali_1.MockRequest({
        method: 'GET'
    });
    let req = new denali_1.Request(mocked);
    let result = parser.parse(req);
    t.true(typeof result.body === 'undefined');
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvbi1hcGktdGVzdC5qcyIsInNvdXJjZVJvb3QiOiIvVXNlcnMvc2Vhd2F0dHMvc3JjL2dpdGh1Yi5jb20vc2Vhd2F0dHMvZGVuYWxpLyIsInNvdXJjZXMiOlsidGVzdC91bml0L3BhcnNlL2pzb24tYXBpLXRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsMEVBQTBFO0FBQzFFLDZCQUF1QjtBQUN2QixtQ0FBNkQ7QUFFN0QscUJBQXFCLElBQVU7SUFDN0IsSUFBSSxNQUFNLEdBQUcsSUFBSSxvQkFBVyxDQUFDO1FBQzNCLE1BQU0sRUFBRSxNQUFNO1FBQ2QsT0FBTyxFQUFFO1lBQ1AsY0FBYyxFQUFFLDBCQUEwQjtTQUMzQztLQUNGLENBQUMsQ0FBQztJQUNILElBQUksR0FBRyxHQUFHLElBQUksZ0JBQU8sQ0FBTSxNQUFNLENBQUMsQ0FBQztJQUNuQyxHQUFHLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztJQUNoQixNQUFNLENBQUMsR0FBRyxDQUFDO0FBQ2IsQ0FBQztBQUVELGFBQUksQ0FBQyw4REFBOEQsRUFBRSxDQUFPLENBQUM7SUFDM0UsSUFBSSxNQUFNLEdBQUcsSUFBSSxzQkFBYSxFQUFFLENBQUM7SUFDakMsSUFBSSxNQUFNLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUM7UUFDcEMsSUFBSSxFQUFFO1lBQ0osSUFBSSxFQUFFLEtBQUs7WUFDWCxVQUFVLEVBQUU7Z0JBQ1YsR0FBRyxFQUFFLElBQUk7YUFDVjtTQUNGO0tBQ0YsQ0FBQyxDQUFDLENBQUM7SUFDSixDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDMUIsQ0FBQyxDQUFBLENBQUMsQ0FBQztBQUVILGFBQUksQ0FBQyxnREFBZ0QsRUFBRSxDQUFPLENBQUM7SUFDN0QsSUFBSSxNQUFNLEdBQUcsSUFBSSxzQkFBYSxFQUFFLENBQUM7SUFDakMsSUFBSSxNQUFNLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUM7UUFDcEMsSUFBSSxFQUFFO1lBQ0osSUFBSSxFQUFFLEtBQUs7WUFDWCxVQUFVLEVBQUU7Z0JBQ1YsR0FBRyxFQUFFLElBQUk7YUFDVjtTQUNGO1FBQ0QsUUFBUSxFQUFFO1lBQ1I7Z0JBQ0UsSUFBSSxFQUFFLE1BQU07Z0JBQ1osVUFBVSxFQUFFO29CQUNWLElBQUksRUFBRSxJQUFJO2lCQUNYO2FBQ0Y7U0FDRjtLQUNGLENBQUMsQ0FBQyxDQUFDO0lBQ0osQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3hCLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNsQyxDQUFDLENBQUEsQ0FBQyxDQUFDO0FBRUgsYUFBSSxDQUFDLHFFQUFxRSxFQUFFLENBQUMsQ0FBQztJQUM1RSxJQUFJLE1BQU0sR0FBRyxJQUFJLHNCQUFhLEVBQUUsQ0FBQztJQUNqQyxJQUFJLE1BQU0sR0FBRyxJQUFJLG9CQUFXLENBQUM7UUFDM0IsTUFBTSxFQUFFLEtBQUs7S0FDZCxDQUFDLENBQUM7SUFDSCxJQUFJLEdBQUcsR0FBRyxJQUFJLGdCQUFPLENBQU0sTUFBTSxDQUFDLENBQUM7SUFDbkMsSUFBSSxNQUFNLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUMvQixDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sTUFBTSxDQUFDLElBQUksS0FBSyxXQUFXLENBQUMsQ0FBQztBQUM3QyxDQUFDLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qIHRzbGludDpkaXNhYmxlOmNvbXBsZXRlZC1kb2NzIG5vLWVtcHR5IG5vLWludmFsaWQtdGhpcyBtZW1iZXItYWNjZXNzICovXG5pbXBvcnQgdGVzdCBmcm9tICdhdmEnO1xuaW1wb3J0IHsgSlNPTkFQSVBhcnNlciwgTW9ja1JlcXVlc3QsIFJlcXVlc3QgfSBmcm9tICdkZW5hbGknO1xuXG5mdW5jdGlvbiBtb2NrUmVxdWVzdChib2R5PzogYW55KSB7XG4gIGxldCBtb2NrZWQgPSBuZXcgTW9ja1JlcXVlc3Qoe1xuICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgIGhlYWRlcnM6IHtcbiAgICAgICdDb250ZW50LXR5cGUnOiAnYXBwbGljYXRpb24vdm5kLmFwaStqc29uJ1xuICAgIH1cbiAgfSk7XG4gIGxldCByZXEgPSBuZXcgUmVxdWVzdCg8YW55Pm1vY2tlZCk7XG4gIHJlcS5ib2R5ID0gYm9keTtcbiAgcmV0dXJuIHJlcTtcbn1cblxudGVzdCgncmV0dXJucyByZXNwb25kZXIgcGFyYW1zIHdpdGggcHJpbWFyeSByZXF1ZXN0IGRhdGEgZmxhdHRlbmVkJywgYXN5bmMgKHQpID0+IHtcbiAgbGV0IHBhcnNlciA9IG5ldyBKU09OQVBJUGFyc2VyKCk7XG4gIGxldCByZXN1bHQgPSBwYXJzZXIucGFyc2UobW9ja1JlcXVlc3Qoe1xuICAgIGRhdGE6IHtcbiAgICAgIHR5cGU6ICdiYXInLFxuICAgICAgYXR0cmlidXRlczoge1xuICAgICAgICBmb286IHRydWVcbiAgICAgIH1cbiAgICB9XG4gIH0pKTtcbiAgdC50cnVlKHJlc3VsdC5ib2R5LmZvbyk7XG59KTtcblxudGVzdCgncmV0dXJucyByZXNwb25kZXIgcGFyYW1zIHdpdGggaW5jbHVkZWQgcmVjb3JkcycsIGFzeW5jICh0KSA9PiB7XG4gIGxldCBwYXJzZXIgPSBuZXcgSlNPTkFQSVBhcnNlcigpO1xuICBsZXQgcmVzdWx0ID0gcGFyc2VyLnBhcnNlKG1vY2tSZXF1ZXN0KHtcbiAgICBkYXRhOiB7XG4gICAgICB0eXBlOiAnYmFyJyxcbiAgICAgIGF0dHJpYnV0ZXM6IHtcbiAgICAgICAgZm9vOiB0cnVlXG4gICAgICB9XG4gICAgfSxcbiAgICBpbmNsdWRlZDogW1xuICAgICAge1xuICAgICAgICB0eXBlOiAnZml6eicsXG4gICAgICAgIGF0dHJpYnV0ZXM6IHtcbiAgICAgICAgICBidXp6OiB0cnVlXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICBdXG4gIH0pKTtcbiAgdC50cnVlKHJlc3VsdC5ib2R5LmZvbyk7XG4gIHQudHJ1ZShyZXN1bHQuaW5jbHVkZWRbMF0uYnV6eik7XG59KTtcblxudGVzdCgnZG9lc25cXCd0IGF0dGVtcHQgdG8gcGFyc2UgYW5kIHJldHVybnMgbm8gYm9keSBpZiByZXF1ZXN0IGJvZHkgZW1wdHknLCAodCkgPT4ge1xuICBsZXQgcGFyc2VyID0gbmV3IEpTT05BUElQYXJzZXIoKTtcbiAgbGV0IG1vY2tlZCA9IG5ldyBNb2NrUmVxdWVzdCh7XG4gICAgbWV0aG9kOiAnR0VUJ1xuICB9KTtcbiAgbGV0IHJlcSA9IG5ldyBSZXF1ZXN0KDxhbnk+bW9ja2VkKTtcbiAgbGV0IHJlc3VsdCA9IHBhcnNlci5wYXJzZShyZXEpO1xuICB0LnRydWUodHlwZW9mIHJlc3VsdC5ib2R5ID09PSAndW5kZWZpbmVkJyk7XG59KTtcbiJdfQ==