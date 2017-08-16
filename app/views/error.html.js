"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const lodash_1 = require("lodash");
const view_1 = require("../../lib/render/view");
let template = lodash_1.template(`
  <html>
    <head>
      <style>
        body {
          font-family: Arial, Helvetica, sans-serif;
          background: #f7f7f7;
          margin: 0;
        }
        pre {
          font-family: Inconsolata, Monaco, Menlo, monospace;
        }
        .headline {
          background: #fff;
          padding: 30px;
          color: #DC4B4B;
          font-family: Inconsolata, Monaco, Menlo, monospace;
          border-bottom: 1px solid #ddd;
          margin-bottom: 0;
        }
        .lead {
          display: block;
          margin-bottom: 7px;
          color: #aaa;
          font-size: 14px;
          font-family: Arial, Helvetica, sans-serif;
          font-weight: 300;
        }
        .details {
          padding: 30px;
        }
      </style>
    </head>
    <body>
      <h1 class='headline'>
        <small class='lead'>There was an error with this request:</small>
        <%= data.error.message %>
      </h1>
      <div class='details'>
        <% if (data.error.action) { %>
          <h2 class='source'>from <%= data.error.action %></h2>
        <% } %>
        <h5>Stacktrace:</h5>
        <pre><code><%= data.error.stack %></code></pre>
      </div>
    </body>
  </html>
`, {
    variable: 'data'
});
class ErrorView extends view_1.default {
    render(action, response, error, options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            response.setHeader('Content-type', 'text/html');
            response.write(template({ error }));
            response.end();
        });
    }
}
exports.default = ErrorView;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXJyb3IuaHRtbC5qcyIsInNvdXJjZVJvb3QiOiIvVXNlcnMvc2Vhd2F0dHMvc3JjL2dpdGh1Yi5jb20vc2Vhd2F0dHMvZGVuYWxpLyIsInNvdXJjZXMiOlsiYXBwL3ZpZXdzL2Vycm9yLmh0bWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsbUNBRWdCO0FBR2hCLGdEQUF5QztBQUV6QyxJQUFJLFFBQVEsR0FBRyxpQkFBZSxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQStDOUIsRUFBRTtJQUNELFFBQVEsRUFBRSxNQUFNO0NBQ2pCLENBQUMsQ0FBQztBQUVILGVBQStCLFNBQVEsY0FBSTtJQUVuQyxNQUFNLENBQUMsTUFBYyxFQUFFLFFBQXdCLEVBQUUsS0FBVSxFQUFFLE9BQXNCOztZQUN2RixRQUFRLENBQUMsU0FBUyxDQUFDLGNBQWMsRUFBRSxXQUFXLENBQUMsQ0FBQztZQUNoRCxRQUFRLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNwQyxRQUFRLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDakIsQ0FBQztLQUFBO0NBRUY7QUFSRCw0QkFRQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIHRlbXBsYXRlIGFzIGNvbXBpbGVUZW1wbGF0ZVxufSBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IHsgU2VydmVyUmVzcG9uc2UgfSBmcm9tICdodHRwJztcbmltcG9ydCBBY3Rpb24sIHsgUmVuZGVyT3B0aW9ucyB9IGZyb20gJy4uLy4uL2xpYi9ydW50aW1lL2FjdGlvbic7XG5pbXBvcnQgVmlldyBmcm9tICcuLi8uLi9saWIvcmVuZGVyL3ZpZXcnO1xuXG5sZXQgdGVtcGxhdGUgPSBjb21waWxlVGVtcGxhdGUoYFxuICA8aHRtbD5cbiAgICA8aGVhZD5cbiAgICAgIDxzdHlsZT5cbiAgICAgICAgYm9keSB7XG4gICAgICAgICAgZm9udC1mYW1pbHk6IEFyaWFsLCBIZWx2ZXRpY2EsIHNhbnMtc2VyaWY7XG4gICAgICAgICAgYmFja2dyb3VuZDogI2Y3ZjdmNztcbiAgICAgICAgICBtYXJnaW46IDA7XG4gICAgICAgIH1cbiAgICAgICAgcHJlIHtcbiAgICAgICAgICBmb250LWZhbWlseTogSW5jb25zb2xhdGEsIE1vbmFjbywgTWVubG8sIG1vbm9zcGFjZTtcbiAgICAgICAgfVxuICAgICAgICAuaGVhZGxpbmUge1xuICAgICAgICAgIGJhY2tncm91bmQ6ICNmZmY7XG4gICAgICAgICAgcGFkZGluZzogMzBweDtcbiAgICAgICAgICBjb2xvcjogI0RDNEI0QjtcbiAgICAgICAgICBmb250LWZhbWlseTogSW5jb25zb2xhdGEsIE1vbmFjbywgTWVubG8sIG1vbm9zcGFjZTtcbiAgICAgICAgICBib3JkZXItYm90dG9tOiAxcHggc29saWQgI2RkZDtcbiAgICAgICAgICBtYXJnaW4tYm90dG9tOiAwO1xuICAgICAgICB9XG4gICAgICAgIC5sZWFkIHtcbiAgICAgICAgICBkaXNwbGF5OiBibG9jaztcbiAgICAgICAgICBtYXJnaW4tYm90dG9tOiA3cHg7XG4gICAgICAgICAgY29sb3I6ICNhYWE7XG4gICAgICAgICAgZm9udC1zaXplOiAxNHB4O1xuICAgICAgICAgIGZvbnQtZmFtaWx5OiBBcmlhbCwgSGVsdmV0aWNhLCBzYW5zLXNlcmlmO1xuICAgICAgICAgIGZvbnQtd2VpZ2h0OiAzMDA7XG4gICAgICAgIH1cbiAgICAgICAgLmRldGFpbHMge1xuICAgICAgICAgIHBhZGRpbmc6IDMwcHg7XG4gICAgICAgIH1cbiAgICAgIDwvc3R5bGU+XG4gICAgPC9oZWFkPlxuICAgIDxib2R5PlxuICAgICAgPGgxIGNsYXNzPSdoZWFkbGluZSc+XG4gICAgICAgIDxzbWFsbCBjbGFzcz0nbGVhZCc+VGhlcmUgd2FzIGFuIGVycm9yIHdpdGggdGhpcyByZXF1ZXN0Ojwvc21hbGw+XG4gICAgICAgIDwlPSBkYXRhLmVycm9yLm1lc3NhZ2UgJT5cbiAgICAgIDwvaDE+XG4gICAgICA8ZGl2IGNsYXNzPSdkZXRhaWxzJz5cbiAgICAgICAgPCUgaWYgKGRhdGEuZXJyb3IuYWN0aW9uKSB7ICU+XG4gICAgICAgICAgPGgyIGNsYXNzPSdzb3VyY2UnPmZyb20gPCU9IGRhdGEuZXJyb3IuYWN0aW9uICU+PC9oMj5cbiAgICAgICAgPCUgfSAlPlxuICAgICAgICA8aDU+U3RhY2t0cmFjZTo8L2g1PlxuICAgICAgICA8cHJlPjxjb2RlPjwlPSBkYXRhLmVycm9yLnN0YWNrICU+PC9jb2RlPjwvcHJlPlxuICAgICAgPC9kaXY+XG4gICAgPC9ib2R5PlxuICA8L2h0bWw+XG5gLCB7XG4gIHZhcmlhYmxlOiAnZGF0YSdcbn0pO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFcnJvclZpZXcgZXh0ZW5kcyBWaWV3IHtcblxuICBhc3luYyByZW5kZXIoYWN0aW9uOiBBY3Rpb24sIHJlc3BvbnNlOiBTZXJ2ZXJSZXNwb25zZSwgZXJyb3I6IGFueSwgb3B0aW9uczogUmVuZGVyT3B0aW9ucykge1xuICAgIHJlc3BvbnNlLnNldEhlYWRlcignQ29udGVudC10eXBlJywgJ3RleHQvaHRtbCcpO1xuICAgIHJlc3BvbnNlLndyaXRlKHRlbXBsYXRlKHsgZXJyb3IgfSkpO1xuICAgIHJlc3BvbnNlLmVuZCgpO1xuICB9XG5cbn1cbiJdfQ==