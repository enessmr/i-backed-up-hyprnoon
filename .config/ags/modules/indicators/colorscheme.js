const { Gio, GLib } = imports.gi;
import Variable from "resource:///com/github/Aylur/ags/variable.js";
import Widget from "resource:///com/github/Aylur/ags/widget.js";
import {
  ConfigToggle,
  ConfigMulipleSelection,
} from "../.commonwidgets/configwidgets.js";
import * as Utils from "resource:///com/github/Aylur/ags/utils.js";
const { execAsync } = Utils;
import { setupCursorHover } from "../.widgetutils/cursorhover.js";
import { showColorScheme } from "../../variables.js";
import { MaterialIcon } from "../.commonwidgets/materialicon.js";
import { gowallArr } from "../.commondata/colorschemes.js";
import { schemeOptionsArr } from "../.commondata/colorschemes.js";
import { RoundedCorner } from "../.commonwidgets/cairo_roundedcorner.js";
const ColorBox = ({ name = "Color", ...rest }) =>
  Widget.Box({
    ...rest,
    homogeneous: true,
    children: [
      Widget.Label({
        label: `${name}`,
      }),
    ],
  });

const ColorSchemeSettingsRevealer = () => {
  const headerButtonIcon = MaterialIcon("expand_more", "norm");
  const header = Widget.Button({
    hpack: "center",
    className: "osd-settings-btn-arrow",
    onClicked: () => {
      content.revealChild = !content.revealChild;
      headerButtonIcon.label = content.revealChild
        ? "expand_less"
        : "expand_more";
    },
    setup: setupCursorHover,
    child: headerButtonIcon,
  });

  const content = Widget.Revealer({
    revealChild: false,
    transition: "slide_down",
    transitionDuration: 200,
    child: ColorSchemeSettings(),
    setup: (self) =>
      self.hook(isHoveredColorschemeSettings, (revealer) => {
        if (isHoveredColorschemeSettings.value == false) {
          setTimeout(() => {
            if (isHoveredColorschemeSettings.value == false)
              revealer.revealChild = false;
            headerButtonIcon.label = "expand_more";
          }, 100);
        }
      }),
  });
  return Widget.EventBox({
    onHover: (self) => {
      isHoveredColorschemeSettings.setValue(true);
    },
    onHoverLost: (self) => {
      isHoveredColorschemeSettings.setValue(false);
    },
    child: Widget.Box({
      vertical: true,
      children: [content, header],
    }),
  });
};

function calculateSchemeInitIndex(optionsArr, searchValue = "content") {
  if (searchValue == "") searchValue = "content";
  const flatArray = optionsArr.flatMap((subArray) => subArray);
  const result = flatArray.findIndex(
    (element) => element.value === searchValue
  );
  const rowIndex = Math.floor(result / optionsArr[0].length);
  const columnIndex = result % optionsArr[0].length;
  return [rowIndex, columnIndex];
}
export const LIGHTDARK_FILE_LOCATION = `${GLib.get_user_state_dir()}/ags/user/colormode.txt`;

export const initTransparency = Utils.exec(
  `bash -c "sed -n \'2p\' ${LIGHTDARK_FILE_LOCATION}"`
);
export const initTransparencyVal = initTransparency == "transparent" ? 1 : 0;

export const initTransparencyMode = Utils.exec(
  `bash -c "sed -n \'7p\' ${LIGHTDARK_FILE_LOCATION}"`
);
export const initTransparencyModeVal =
  initTransparencyMode == "intense" ? 1 : 0;

export const initScheme = Utils.exec(
  `bash -c "sed -n \'3p\' ${LIGHTDARK_FILE_LOCATION}"`
);
export const initSchemeIndex = calculateSchemeInitIndex(
  schemeOptionsArr,
  initScheme
);

export const initGowall = Utils.exec(
  `bash -c "sed -n \'4p\' ${LIGHTDARK_FILE_LOCATION}"`
);
export const initGowallIndex = calculateSchemeInitIndex(gowallArr, initGowall);

export const initBorder = Utils.exec(
  `bash -c "sed -n \'5p\' ${LIGHTDARK_FILE_LOCATION}"`
);
export const initBorderVal = initBorder == "border" ? 1 : 0;

export const initVibrancy = Utils.exec(
  `bash -c "sed -n \'6p\' ${LIGHTDARK_FILE_LOCATION}"`
);
export const initVibrancyVal = initVibrancy == "vibrant" ? 1 : 0;

const ColorSchemeSettings = () =>
  Widget.Box({
    className: "osd-colorscheme-settings spacing-v-5 margin-20",
    css: `padding:0 2rem `,
    vertical: true,
    vpack: "center",
    children: [
      Widget.Box({
        vertical: true,
        children: [
          Widget.Label({
            xalign: 0,
            className: "txt-norm titlefont onSurfaceVariant",
            label: getString("Options"),
            hpack: "center",
          }),
          //////////////////
          ConfigToggle({
            icon: "dark_mode",
            name: getString("Dark Mode"),
            desc: getString("Ya should go to sleep!"),
            initValue: darkMode.value,
            onChange: (_, newValue) => {
              darkMode.value = !!newValue;
            },
            extraSetup: (self) =>
              self.hook(darkMode, (self) => {
                self.enabled.value = darkMode.value;
              }),
          }),
          ConfigToggle({
            icon: "format_paint",
            name: getString("Vibrancy"),
            desc: getString("Make Everything Vibrant"),
            initValue: initVibrancyVal,
            onChange: async (self, newValue) => {
              try {
                const vibrancy = newValue == 0 ? "normal" : "vibrant";
                await execAsync([
                  `bash`,
                  `-c`,
                  `mkdir -p ${GLib.get_user_state_dir()}/ags/user && sed -i "6s/.*/${vibrancy}/"  ${GLib.get_user_state_dir()}/ags/user/colormode.txt`,
                ]);
                await execAsync([
                  "bash",
                  "-c",
                  `${App.configDir}/scripts/color_generation/applycolor.sh &`,
                ]);
              } catch (error) {
                console.error("Error changing vibrancy:", error);
              }
            },
          }),
          ConfigToggle({
            icon: "border_clear",
            name: getString("Transparency"),
            desc: getString("Make Everything transparent"),
            initValue: initTransparencyVal,
            onChange: async (self, newValue) => {
              try {
                const transparency = newValue == 0 ? "opaque" : "transparent";
                await execAsync([
                  `bash`,
                  `-c`,
                  `mkdir -p ${GLib.get_user_state_dir()}/ags/user && sed -i "2s/.*/${transparency}/"  ${GLib.get_user_state_dir()}/ags/user/colormode.txt`,
                ]);
                await execAsync([
                  "bash",
                  "-c",
                  `${App.configDir}/scripts/color_generation/applycolor.sh &`,
                ]);
              } catch (error) {
                console.error("Error changing transparency:", error);
              }
            },
          }),
          Widget.Box({
            css: `margin-left:1rem`,
            child: ConfigToggle({
              icon: "contrast",
              name: getString("Glass Transparency"),
              desc: getString("intense transparent mode"),
              initValue: initTransparencyModeVal,
              onChange: async (self, newValue) => {
                try {
                  const transparencyMode = newValue == 0 ? "normal" : "intense";
                  await execAsync([
                    `bash`,
                    `-c`,
                    `mkdir -p ${GLib.get_user_state_dir()}/ags/user && sed -i "7s/.*/${transparencyMode}/"  ${GLib.get_user_state_dir()}/ags/user/colormode.txt`,
                  ]);
                  await execAsync([
                    "bash",
                    "-c",
                    `${App.configDir}/scripts/color_generation/applycolor.sh &`,
                  ]);
                } catch (error) {
                  console.error("Error changing transparency:", error);
                }
              },
            }),
          }),
          ConfigToggle({
            icon: "ripples",
            name: getString("Borders"),
            desc: getString("Make Everything Bordered"),
            initValue: initBorderVal,
            onChange: async (self, newValue) => {
              try {
                const border = newValue == 0 ? "noborder" : "border";
                await execAsync([
                  `bash`,
                  `-c`,
                  `mkdir -p ${GLib.get_user_state_dir()}/ags/user && sed -i "5s/.*/${border}/"  ${GLib.get_user_state_dir()}/ags/user/colormode.txt`,
                ]);
                await execAsync([
                  "bash",
                  "-c",
                  `${App.configDir}/scripts/color_generation/applycolor.sh &`,
                ]);
              } catch (error) {
                console.error("Error changing border mode:", error);
              }
            },
          }),
        ],
      }),
      Widget.Box({
        vertical: true,
        spacing: 10,
        children: [
          Widget.Label({
            xalign: 0,
            className: "txt-norm titlefont onSurfaceVariant",
            label: getString("Scheme styles"),
            hpack: "center",
          }),
          //////////////////
          ConfigMulipleSelection({
            hpack: "center",
            vpack: "center",
            optionsArr: schemeOptionsArr,
            initIndex: initSchemeIndex,
            onChange: async (value, name) => {
              try {
                await execAsync([
                  `bash`,
                  `-c`,
                  `sed -i "3s/.*/${value}/"  ${GLib.get_user_state_dir()}/ags/user/colormode.txt`,
                ]);

                applyColor();
                runMatugen();
              } catch (error) {
                console.error("Error in onChange:", error);
              }
            },
          }),
          Widget.Label({
            xalign: 0,
            className: "txt-norm titlefont onSurfaceVariant",
            label: getString("Wallpaper Styles"),
            hpack: "center",
          }),
          ConfigMulipleSelection({
            hpack: "center",
            vpack: "center",
            css: `margin-bottom:1.5rem`,
            optionsArr: gowallArr,
            initIndex: initGowallIndex,
            onChange: async (value, name) => {
              await execAsync([
                `bash`,
                `-c`,
                `mkdir -p ${GLib.get_user_state_dir()}/ags/user && sed -i "4s/.*/${value}/"  ${GLib.get_user_state_dir()}/ags/user/colormode.txt`,
              ]);
              await execAsync([
                `bash`,
                `-c`,
                `${App.configDir}/scripts/color_generation/gowall.sh`,
              ]).catch(print);
            },
          }),
          //////////////////
        ],
      }),
    ],
  });
const ColorschemeContent = () =>
  Widget.Box({
    hpack: "fill",
    children: [
      Widget.Box({
        className: "osd-colorscheme elevation sidebar-round",
        vertical: true,
        hpack: "center",
        children: [
          Widget.Label({
            xalign: 0,
            css: `padding:0.26rem 0`,
            className: "txt-large titlefont txt",
            label: getString("Appearence"),
            hpack: "center",
          }),
          Widget.Box({
            className: "spacing-h-5",
            hpack: "center",
            children: [
              ColorBox({ name: "P", className: "osd-color osd-color-primary" }),
              ColorBox({
                name: "S",
                className: "osd-color osd-color-secondary",
              }),
              ColorBox({
                name: "T",
                className: "osd-color osd-color-tertiary",
              }),
              ColorBox({
                name: "Sf",
                className: "osd-color osd-color-surface",
              }),
              ColorBox({
                name: "Sf-i",
                className: "osd-color osd-color-inverseSurface",
              }),
              ColorBox({ name: "E", className: "osd-color osd-color-error" }),
              ColorBox({
                name: "P-c",
                className: "osd-color osd-color-primaryContainer",
              }),
              ColorBox({
                name: "S-c",
                className: "osd-color osd-color-secondaryContainer",
              }),
              ColorBox({
                name: "T-c",
                className: "osd-color osd-color-tertiaryContainer",
              }),
              ColorBox({
                name: "Sf-c",
                className: "osd-color osd-color-surfaceContainer",
              }),
              ColorBox({
                name: "Sf-v",
                className: "osd-color osd-color-surfaceVariant",
              }),
              ColorBox({
                name: "E-c",
                className: "osd-color osd-color-errorContainer",
              }),
            ],
          }),
          ColorSchemeSettingsRevealer(),
        ],
        setup: (self) =>
          self.hook(useCorners, () => {
            self.className = useCorners.value
              ? "osd-colorscheme"
              : "osd-colorscheme osd-elevation sidebar-round";
          }),
      }),
    ],
  });
const CornerBox = (corner, vpack) =>
  Widget.Box({
    setup: (self) =>
      self.hook(useCorners, () => {
        self.children = useCorners.value
          ? [
              RoundedCorner(corner, {
                vpack,
                className: "corner-colorscheme corner",
              }),
            ]
          : [];
      }),
  });

const BorderedColorSchemeContent = () =>
  Widget.Box({
    children: [
      CornerBox("topright", "start"),
      ColorschemeContent(),
      CornerBox("topleft", "start"),
    ],
  });

const isHoveredColorschemeSettings = Variable(false);

export default () =>
  Widget.Revealer({
    transition: "slide_down",
    transitionDuration: userOptions.asyncGet().animations.durationLarge,
    child: BorderedColorSchemeContent(),
    setup: (self) => {
      self
        .hook(showColorScheme, (revealer) => {
          if (showColorScheme.value == true) revealer.revealChild = true;
          else revealer.revealChild = isHoveredColorschemeSettings.value;
        })
        .hook(isHoveredColorschemeSettings, (revealer) => {
          if (isHoveredColorschemeSettings.value == false) {
            setTimeout(() => {
              if (isHoveredColorschemeSettings.value == false)
                revealer.revealChild = showColorScheme.value;
            }, 0);
          }
        });
    },
  });
