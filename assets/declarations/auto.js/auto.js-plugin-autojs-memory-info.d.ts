// Type definitions for Auto.js external module plugin-autojs-memory-info.js
//
// Project: https://github.com/SuperMonster003/Ant-Forest
// Definitions by: SuperMonster003 <https://github.com/SuperMonster003>
// Definitions: https://github.com/SuperMonster003/Ant-Forest/assets/declarations
// TypeScript Version: 4.3.5
//
// Last modified: Oct 21, 2021

/// <reference path="./auto.js-declarations.d.ts" />

/**
 * @Source %project%/assets/modules/plugin-autojs-memory-info.js
 */

declare namespace Plugin$MemoryInfo {
    interface Options {
        parent_view?: UI.View;
        view_config?: {
            img?: UI.ViewAttribute;
            title?: UI.ViewAttribute;
            sys?: UI.ViewAttribute;
            rt?: UI.ViewAttribute;
            proc?: UI.ViewAttribute;
            uss_n_pss?: UI.ViewAttribute;
            btn_close?: UI.ViewAttribute;
            btn_restart_process?: UI.ViewAttribute;
        };
    }

    interface ConfigPreset {
        sentiment: string;
        threshold: number;
        tint: { icon: Color$, text: Color$ };
    }
}