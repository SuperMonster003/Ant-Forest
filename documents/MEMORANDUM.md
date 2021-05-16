###### 2021/02/12
'Protect' function ('提醒守护功能') went online on around Dec 31, 2020.  
At the same time, 'help' function ('帮收功能') was disabled (seems permanently).  
Thus, all code about 'help' has been removed from this project.

###### 2021/04/27
Thank [TonyJiangWJ](https://github.com/TonyJiangWJ) for the great idea :)
```typescript
runtime.getAccessibilityBridge()
    .setWindowFilter(new com.stardust.autojs.core.accessibility
        .AccessibilityBridge$WindowFilter({
            filter: (info: android.view.accessibility
                .AccessibilityWindowInfo) => boolean,
        }));
```