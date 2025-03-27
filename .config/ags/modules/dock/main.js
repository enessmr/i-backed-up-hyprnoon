import Widget from "resource:///com/github/Aylur/ags/widget.js";
import Dock from "./dock.js";

export default (monitor = 0) =>
  Widget.Window({
    monitor,
    name: `dock${monitor}`,
    exclusivity: "ignore",
    layer: userOptions.asyncGet().dock.layer,
    anchor: ["bottom"],
    visible: true,
    child: Dock(monitor),
  });
