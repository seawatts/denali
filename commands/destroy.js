"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const denali_cli_1 = require("denali-cli");
/**
 * Remove scaffolded code from your app
 *
 * @package commands
 */
class DestroyCommand extends denali_cli_1.Command {
    static configureSubcommands(commandName, yargs, projectPkg) {
        return denali_cli_1.Blueprint.findAndConfigureBlueprints(yargs, 'destroy', projectPkg);
    }
}
/* tslint:disable:completed-docs typedef */
DestroyCommand.commandName = 'destroy';
DestroyCommand.description = 'Remove scaffolded code from your app';
DestroyCommand.longDescription = denali_cli_1.unwrap `
    Removes the code generated during a \`denali generate\` command. Errs on the
    side of caution when deleting code - it will only remove files that exactly
    match the generated output. Modified files will be left untouched. `;
DestroyCommand.params = '<blueprint>';
DestroyCommand.flags = {
    skipPostUninstall: {
        description: "Don't run any post uninstall hooks for the blueprint",
        default: false,
        type: 'boolean'
    }
};
exports.default = DestroyCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVzdHJveS5qcyIsInNvdXJjZVJvb3QiOiIvVXNlcnMvc2Vhd2F0dHMvc3JjL2dpdGh1Yi5jb20vc2Vhd2F0dHMvZGVuYWxpLyIsInNvdXJjZXMiOlsiY29tbWFuZHMvZGVzdHJveS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDJDQUF3RDtBQUd4RDs7OztHQUlHO0FBQ0gsb0JBQW9DLFNBQVEsb0JBQU87SUFvQnZDLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxXQUFtQixFQUFFLEtBQVUsRUFBRSxVQUFlO1FBQ3BGLE1BQU0sQ0FBQyxzQkFBUyxDQUFDLDBCQUEwQixDQUFDLEtBQUssRUFBRSxTQUFTLEVBQUUsVUFBVSxDQUFDLENBQUM7SUFDNUUsQ0FBQzs7QUFwQkQsMkNBQTJDO0FBQ3BDLDBCQUFXLEdBQUcsU0FBUyxDQUFDO0FBQ3hCLDBCQUFXLEdBQUcsc0NBQXNDLENBQUM7QUFDckQsOEJBQWUsR0FBRyxtQkFBTSxDQUFBOzs7d0VBR3VDLENBQUM7QUFFaEUscUJBQU0sR0FBRyxhQUFhLENBQUM7QUFFdkIsb0JBQUssR0FBRztJQUNiLGlCQUFpQixFQUFFO1FBQ2pCLFdBQVcsRUFBRSxzREFBc0Q7UUFDbkUsT0FBTyxFQUFFLEtBQUs7UUFDZCxJQUFJLEVBQU8sU0FBUztLQUNyQjtDQUNGLENBQUM7QUFsQkosaUNBd0JDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tbWFuZCwgQmx1ZXByaW50LCB1bndyYXAgfSBmcm9tICdkZW5hbGktY2xpJztcbmltcG9ydCAqIGFzIHlhcmdzIGZyb20gJ3lhcmdzJztcblxuLyoqXG4gKiBSZW1vdmUgc2NhZmZvbGRlZCBjb2RlIGZyb20geW91ciBhcHBcbiAqXG4gKiBAcGFja2FnZSBjb21tYW5kc1xuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEZXN0cm95Q29tbWFuZCBleHRlbmRzIENvbW1hbmQge1xuXG4gIC8qIHRzbGludDpkaXNhYmxlOmNvbXBsZXRlZC1kb2NzIHR5cGVkZWYgKi9cbiAgc3RhdGljIGNvbW1hbmROYW1lID0gJ2Rlc3Ryb3knO1xuICBzdGF0aWMgZGVzY3JpcHRpb24gPSAnUmVtb3ZlIHNjYWZmb2xkZWQgY29kZSBmcm9tIHlvdXIgYXBwJztcbiAgc3RhdGljIGxvbmdEZXNjcmlwdGlvbiA9IHVud3JhcGBcbiAgICBSZW1vdmVzIHRoZSBjb2RlIGdlbmVyYXRlZCBkdXJpbmcgYSBcXGBkZW5hbGkgZ2VuZXJhdGVcXGAgY29tbWFuZC4gRXJycyBvbiB0aGVcbiAgICBzaWRlIG9mIGNhdXRpb24gd2hlbiBkZWxldGluZyBjb2RlIC0gaXQgd2lsbCBvbmx5IHJlbW92ZSBmaWxlcyB0aGF0IGV4YWN0bHlcbiAgICBtYXRjaCB0aGUgZ2VuZXJhdGVkIG91dHB1dC4gTW9kaWZpZWQgZmlsZXMgd2lsbCBiZSBsZWZ0IHVudG91Y2hlZC4gYDtcblxuICBzdGF0aWMgcGFyYW1zID0gJzxibHVlcHJpbnQ+JztcblxuICBzdGF0aWMgZmxhZ3MgPSB7XG4gICAgc2tpcFBvc3RVbmluc3RhbGw6IHtcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkRvbid0IHJ1biBhbnkgcG9zdCB1bmluc3RhbGwgaG9va3MgZm9yIHRoZSBibHVlcHJpbnRcIixcbiAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgdHlwZTogPGFueT4nYm9vbGVhbidcbiAgICB9XG4gIH07XG5cbiAgcHJvdGVjdGVkIHN0YXRpYyBjb25maWd1cmVTdWJjb21tYW5kcyhjb21tYW5kTmFtZTogc3RyaW5nLCB5YXJnczogYW55LCBwcm9qZWN0UGtnOiBhbnkpOiB5YXJncy5Bcmd2IHtcbiAgICByZXR1cm4gQmx1ZXByaW50LmZpbmRBbmRDb25maWd1cmVCbHVlcHJpbnRzKHlhcmdzLCAnZGVzdHJveScsIHByb2plY3RQa2cpO1xuICB9XG5cbn1cbiJdfQ==