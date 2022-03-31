require('./mod-global');
let {$$disp} = require('./ext-device');
let {imagesx} = require('./ext-images');
let {timersx} = require('./ext-timers');
let {consolex} = require('./ext-console');

let def = {};
def.a = 2;

let exp = {
    ForestImagePool: (function $iiFe() {
        /**
         * @param {Object} [config]
         * @param {number} [config.interval=120]
         * @param {number} [config.limit=3]
         * @param {boolean} [config.isDebug=undefined]
         */
        function Pool(config) {
            let _data = [];

            Object.defineProperties(this, {
                data: {
                    get() {
                        for (let i = 0; i < _data.length; i += 1) {
                            let _img = _data[i];
                            if (!imagesx.isImageWrapper(_img) || imagesx.isRecycled(_img)) {
                                _data.splice(i--, 1);
                            }
                        }
                        return _data;
                    },
                    enumerable: true,
                },
            });

            let _cfg = config || {};
            this.interval = _cfg.interval || 120;
            this.limit = _cfg.limit || 3;
            this.isDebug = _cfg.isDebug;
        }

        Pool.prototype = {
            constructor: Pool,
            get len() {
                return this.data.length;
            },
            isEmpty() {
                return this.len === 0;
            },
            isNonEmpty() {
                return this.len > 0;
            },
            isFilledUp() {
                return this.len >= this.limit;
            },
            isOverflow() {
                return this.len > this.limit;
            },
            add(capt, options) {
                // @Overload
                if (!imagesx.isImageWrapper(capt) && isPlainObject(capt)) {
                    return this.add(null, capt);
                }
                let _opt = options || {};
                if (typeof _opt.isDebug !== 'boolean') {
                    _opt.isDebug = this.isDebug;
                }
                let _capt = capt || imagesx.capt(Object.assign(_opt, {clone: true}));
                let _debug = consolex.debug.fuel(_opt);

                _debug('添加森林采样: ' + imagesx.getName(_capt));
                this.data.unshift(_capt);
                if (this.isOverflow()) {
                    _debug('采样样本数量超过阈值: ' + this.limit);
                    while (this.isOverflow()) {
                        let _c = this.data.pop();
                        _debug('移除并回收最旧样本: ' + imagesx.getName(_c));
                        imagesx.reclaim(_c);
                    }
                }
            },
            reclaimAll(options) {
                let _opt = options || {};
                if (typeof _opt.isDebug !== 'boolean') {
                    _opt.isDebug = this.isDebug;
                }
                let _debug = consolex.debug.fuel(_opt);

                if (this.len) {
                    _debug('回收全部森林采样');
                    this.data.forEach((c) => {
                        _debug('已回收: ' + imagesx.getName(c));
                        imagesx.reclaim(c);
                    });
                    this.clear();
                    _debug('森林样本已清空');
                }
            },
            clear() {
                this.data.splice(0);
            },
            intermit(offset) {
                sleep(this.interval - offset);
            },
        };

        return Pool;
    })(),
    // /**
    //  * @param {{
    //  *     isDebug?: boolean,
    //  *     pool?: object,
    //  *     config?: {
    //  *         forestImagePoolLimit?: number,
    //  *         forestImagePoolItv?: number,
    //  *     },
    //  * }} [options]
    //  * @return {AntForest.EnergyBall.Result}
    //  */
    // findEnergyBalls(options) {
    //     let _ = {
    //         defaultConfig: {
    //             ripeBallDetectColorVal: '#DEFF00',
    //             ripeBallDetectThreshold: 13,
    //             energyBallsRecognitionRegion: [0.1, 0.15, 0.9, 0.45],
    //             houghSrcImageStrategy: {
    //                 grayscale: true,
    //                 medianBlur: true,
    //                 blur: true,
    //                 adaptiveThreshold: true,
    //                 bilateralFilter: false,
    //             },
    //             houghResultsStrategy: {
    //                 antiOverlap: true,
    //                 symmetrical: true,
    //                 linearInterpolate: true,
    //             },
    //             minBallsDistance: 0.09,
    //             forestImagePoolLimit: 3,
    //             forestImagePoolItv: 60,
    //             homepageWaterBallMaxHueNoBlue: 47,
    //         },
    //         map: {
    //             grayscale: '灰度化',
    //             adaptiveThreshold: '自适应阈值',
    //             medianBlur: '中值滤波',
    //             blur: '均值滤波',
    //             bilateralFilter: '双边滤波',
    //             imgSamplesProcessing: '数据处理',
    //             total: '全部用时',
    //         },
    //         sortByX: (a, b) => a.x === b.x ? 0 : a.x > b.x ? 1 : -1,
    //     };
    //
    //     let $ = {
    //         /**
    //          * @type {typeof AntForest.EnergyBall.Info.Duration.duration}
    //          */
    //         duration: {
    //             beginning: timersx.rec.save('houghBeginning'),
    //         },
    //         balls: {
    //             /**
    //              * @type {AntForest.EnergyBall.Balls}
    //              */
    //             data: [],
    //             /**
    //              * @param {AntForest.EnergyBall.Ball} o
    //              * @param {AntForest.EnergyBall.Type} [type]
    //              */
    //             add(o, type) {
    //                 if (!isPlainObject(o)) {
    //                     throw Error(`A "data" is required for "${this.add.name}"`);
    //                 }
    //                 if (typeof o.type !== 'string') {
    //                     if (typeof type !== 'string') {
    //                         throw Error(`A "type" is required for "${this.add.name}"`);
    //                     }
    //                     this.data.push(Object.assign({}, o, {type: type}));
    //                 } else {
    //                     this.data.push(o);
    //                 }
    //             },
    //             /**
    //              * @return {AntForest.EnergyBall.Balls}
    //              */
    //             getFlatted() {
    //                 return this.data;
    //             },
    //             /**
    //              * @return {AntForest.EnergyBall.Info.ClassifiedWithoutType}
    //              */
    //             getClassified() {
    //                 let classified = {};
    //                 this.data.forEach((o) => {
    //                     Object.ensureKey(classified, o.type, []);
    //                     let cloned = Object.shallowClone(o);
    //                     delete cloned.type;
    //                     classified[o.type].push(cloned);
    //                 });
    //                 return classified;
    //             },
    //             getLength() {
    //                 return this.data.length;
    //             },
    //             getFirstBall() {
    //                 return this.data[0];
    //             },
    //             getLastBall() {
    //                 return this.data[Math.max(this.getLength() - 1, 0)];
    //             },
    //             antiOverlapIFN() {
    //                 if (this.isAntiOverlapAvail()) {
    //                     this.antiOverlap();
    //                 }
    //             },
    //             isAntiOverlapAvail() {
    //                 return Boolean($.config.houghResultsStrategy.antiOverlap);
    //             },
    //             antiOverlap() {
    //                 const SAME_BALL_DIST_THRESHOLD = $.minDist;
    //                 const SAME_DIMEN_THRESHOLD = cX(9);
    //
    //                 let balls = this;
    //
    //                 let $ao = {
    //                     classify() {
    //                         let classified = balls.getClassified();
    //
    //                         this.normals = classified.ripe.concat(classified.naught);
    //                         this.normalsOriLength = this.normals.length;
    //
    //                         this.waters = classified.water;
    //                         this.watersOriLength = this.waters.length;
    //                     },
    //                     process() {
    //                         this.greet();
    //                         this.classify();
    //
    //                         this.antiX(this.normals);
    //                         this.antiX(this.waters);
    //                         this.antiXY(this.normals, this.waters);
    //
    //                         this.debugLength();
    //                     },
    //                     greet() {
    //                         $.debug('覆盖检测处理...');
    //                     },
    //                     /**
    //                      * @param balls - __@Mutable__
    //                      */
    //                     antiX(balls) {
    //                         let $ax = {
    //                             /**
    //                              * @type {AntForest.EnergyBall.Basic[][]}
    //                              */
    //                             ballsGroups: [[]],
    //                             process() {
    //                                 if (this.trigger()) {
    //                                     this.initBallsGroups();
    //                                     this.rebuildBallsReasonably();
    //                                 }
    //                             },
    //                             trigger() {
    //                                 return balls.length > 1;
    //                             },
    //                             initBallsGroups() {
    //                                 balls.forEach((ball) => {
    //                                     if (this.isLatestBallsGroupEmpty() || this.isSameAsLatestBall(ball)) {
    //                                         this.addBallIntoLatestGroup(ball);
    //                                     } else {
    //                                         this.addBallAsNewGroup(ball);
    //                                     }
    //                                 });
    //                             },
    //                             rebuildBallsReasonably() {
    //                                 balls.splice(0);
    //
    //                                 // @Mutation for @Param balls
    //                                 this.ballsGroups.forEach((ballsInGroup, idx) => {
    //                                     ballsInGroup.sort(_.sortByX);
    //                                     let medBall = this.getMedianBall(ballsInGroup);
    //                                     let rebuilt = $ao.getReasonableBall(ballsInGroup);
    //                                     balls[idx] = Object.assign(medBall, rebuilt);
    //                                 });
    //                             },
    //                             getMedianBall(balls) {
    //                                 return balls[Math.floor(balls.length / 2)];
    //                             },
    //                             isLatestBallsGroupEmpty() {
    //                                 return this.getLatestBallsGroup().length === 0;
    //                             },
    //                             getLatestBallsGroup() {
    //                                 return this.ballsGroups[this.ballsGroups.length - 1];
    //                             },
    //                             isSameAsLatestBall(ball) {
    //                                 let latestBall = this.getLatestBall();
    //                                 return this.isTakenAsSameBall(ball, latestBall);
    //                             },
    //                             getLatestBall() {
    //                                 let latestBallsGroup = this.getLatestBallsGroup();
    //                                 return latestBallsGroup[latestBallsGroup.length - 1];
    //                             },
    //                             isTakenAsSameBall(ballA, ballB) {
    //                                 return Math.abs(ballA.x - ballB.x) < SAME_BALL_DIST_THRESHOLD;
    //                             },
    //                             addBallIntoLatestGroup(ball) {
    //                                 this.getLatestBallsGroup().push(ball);
    //                             },
    //                             addBallAsNewGroup(ball) {
    //                                 this.ballsGroups.push([ball]);
    //                             },
    //                         };
    //
    //                         $ax.process();
    //                     },
    //                     /**
    //                      * @param {AntForest.EnergyBall.Basic[]} samples
    //                      * @param {AntForest.EnergyBall.Basic[]} [references]
    //                      * @returns {boolean}
    //                      */
    //                     antiXY(samples, references) {
    //                         let $axy = {
    //                             process() {
    //                                 if (references) {
    //                                     references.forEach((ref) => {
    //                                         for (let i = 0; i < samples.length; i += 1) {
    //                                             this.checkSample(samples[i], ref, i);
    //                                         }
    //                                     });
    //                                 } else {
    //                                     for (let i = 1; i < samples.length; i += 1) {
    //                                         this.checkSample(samples[i - 1], samples[i], i);
    //                                     }
    //                                 }
    //                             },
    //                             /**
    //                              * @param {AntForest.EnergyBall.Basic} smp
    //                              * @param {AntForest.EnergyBall.Basic} ref
    //                              * @param {number} i
    //                              */
    //                             // @Mutation for @Param samples
    //                             checkSample(smp, ref, i) {
    //                                 this.isTakenAsSameDimen(smp.x, ref.x) &&
    //                                 this.isTakenAsSameDimen(smp.y, ref.y) &&
    //                                 samples.splice(i--, 1);
    //                             },
    //                             isTakenAsSameDimen(a, b) {
    //                                 return Math.abs(a - b) < $.minDist;
    //                             },
    //                         };
    //
    //                         $axy.process();
    //                     },
    //                     /**
    //                      * @param {AntForest.EnergyBall.Basic[]} balls
    //                      * @returns {AntForest.EnergyBall.Pocket}
    //                      */
    //                     getReasonableBall(balls) {
    //                         let $rb = {
    //                             /**
    //                              * @type {number[][]}
    //                              */
    //                             dimenGroups: [[]],
    //                             getResult() {
    //                                 return {
    //                                     x: this.getReasonableDimen('x'),
    //                                     y: this.getReasonableDimen('y'),
    //                                     r: this.getReasonableDimen('r'),
    //                                 };
    //                             },
    //                             /**
    //                              * @param {keyof AntForest.EnergyBall.Pocket} dimen
    //                              * @returns {number}
    //                              * @example
    //                              * sample: [
    //                              *    {d: 1}, {d: 3}, {d: 5}, {d: 12}, {d: 20},
    //                              *    {d: 21}, {d: 22}, {d: 90}, {d: 90},
    //                              * ]
    //                              * initDimenGroups (grouping by minDist) : [
    //                              *    [{d: 1}, {d: 3}, {d: 5}],
    //                              *    [{d: 12}],
    //                              *    [{d: 20}, {d: 21}, {d: 22}],
    //                              *    [{d: 90}, {d: 90}],
    //                              * ]
    //                              * sortByGroupLen: (descend) [
    //                              *    [{d: 1}, {d: 3}, {d: 5}], // 3
    //                              *    [{d: 20}, {d: 21}, {d: 22}], // 3
    //                              *    [{d: 90}, {d: 90}], // 2
    //                              *    [{d: 12}], // 1
    //                              * ]
    //                              * cutOutASection (first group with same length) : [
    //                              *    [{d: 1}, {d: 3}, {d: 5}],
    //                              *    [{d: 20}, {d: 21}, {d: 22}],
    //                              * ]
    //                              * sortByGroupStd (ascend) : [
    //                              *    [{d: 20}, {d: 21}, {d: 22}], // ~= 0.816
    //                              *    [{d: 1}, {d: 3}, {d: 5}], // ~= 1.633
    //                              * ]
    //                              * getFirstDimenGroupMedian: 21
    //                              */
    //                             getReasonableDimen(dimen) {
    //                                 this.initDimenGroups(dimen);
    //                                 this.sortByGroupLen();
    //                                 this.cutOutASection();
    //                                 this.sortByGroupStd();
    //
    //                                 return this.getFirstDimenGroupMedian();
    //                             },
    //                             initDimenGroups(dimen) {
    //                                 balls
    //                                     .map(ball => ball[dimen])
    //                                     // @Ascend
    //                                     .sort((x, y) => x === y ? 0 : x > y ? 1 : -1)
    //                                     .forEach((dimen) => {
    //                                         if (this.isLatestDimenGroupEmpty() || this.isSameAsLatestDimen(dimen)) {
    //                                             this.addDimenIntoLatestGroup(dimen);
    //                                         } else {
    //                                             this.addDimenAsNewGroup(dimen);
    //                                         }
    //                                     });
    //                             },
    //                             sortByGroupLen() {
    //                                 // e.g.(1/3): [5, 5, 5, 4, 3, 3, 2, 1] or [9, 8, 8, 7, 7, 6] (length)
    //                                 // @Descend
    //                                 this.dimenGroups.sort((g1, g2) => {
    //                                     let x = g1.length;
    //                                     let y = g2.length;
    //                                     return x === y ? 0 : x < y ? 1 : -1;
    //                                 });
    //                             },
    //                             cutOutASection() {
    //                                 // only the first group with the same length kept
    //                                 // e.g.(2/3): [5, 5, 5] or [9] (length)
    //                                 for (let i = 1, l = this.dimenGroups.length; i < l; i += 1) {
    //                                     if (this.dimenGroups[i].length < this.dimenGroups[i - 1].length) {
    //                                         this.dimenGroups.splice(i);
    //                                         break;
    //                                     }
    //                                 }
    //                             },
    //                             sortByGroupStd() {
    //                                 if (this.dimenGroups.length > 1) {
    //                                     // e.g.(3/3): [5, 5, 5] (length)
    //                                     // @Ascend
    //                                     this.dimenGroups.sort((g1, g2) => {
    //                                         let x = Math.std(g1);
    //                                         let y = Math.std(g2);
    //                                         return x === y ? 0 : x > y ? 1 : -1;
    //                                     });
    //                                 }
    //                             },
    //                             getFirstDimenGroupMedian() {
    //                                 return Math.median(this.getFirstDimenGroup());
    //                             },
    //                             isSameAsLatestDimen(dimen) {
    //                                 let latestDimen = this.getLatestDimen();
    //                                 return this.isTakenAsSameDimen(dimen, latestDimen);
    //                             },
    //                             isTakenAsSameDimen(x, y) {
    //                                 return Math.abs(x - y) < SAME_DIMEN_THRESHOLD;
    //                             },
    //                             isLatestDimenGroupEmpty() {
    //                                 return this.getLatestDimenGroup().length === 0;
    //                             },
    //                             getFirstDimenGroup() {
    //                                 return this.dimenGroups[0];
    //                             },
    //                             getLatestDimenGroup() {
    //                                 return this.dimenGroups[this.dimenGroups.length - 1];
    //                             },
    //                             getLatestDimen() {
    //                                 let latestDimenGroup = this.getLatestDimenGroup();
    //                                 return latestDimenGroup[latestDimenGroup.length - 1];
    //                             },
    //                             addDimenAsNewGroup(dimen) {
    //                                 this.dimenGroups.push([dimen]);
    //                             },
    //                             addDimenIntoLatestGroup(dimen) {
    //                                 this.getLatestDimenGroup().push(dimen);
    //                             },
    //                         };
    //
    //                         return $rb.getResult();
    //                     },
    //                     debugLength() {
    //                         balls.debugLength('water', this.watersOriLength, this.waters.length);
    //                         balls.debugLength('standard', this.normalsOriLength, this.normals.length);
    //                     },
    //                 };
    //
    //                 $ao.process();
    //             },
    //             symmetricalIFN() {
    //                 if (this.isSymmetricalAvail()) {
    //                     this.symmetrical();
    //                 }
    //             },
    //             isSymmetricalAvail() {
    //                 if (!$.config.houghResultsStrategy.symmetrical) {
    //                     return false;
    //                 }
    //                 if (this.getLength() === 1) {
    //                     let {x} = this.getFirstBall();
    //                     return Math.abs(x - halfW) > $.minDist;
    //                 }
    //                 return this.getLength() > 0;
    //             },
    //             symmetrical() {
    //                 let balls = this;
    //
    //                 let $s = {
    //                     getResult() {
    //                         this.greet();
    //
    //                         let len = balls.getLength();
    //
    //                         let right_ball = this.getRightBall();
    //                         let left_ball = this.getLeftBall();
    //                         let max = right_ball.x;
    //                         let min = left_ball.x;
    //                         let ext = Math.max(max - halfW, halfW - min);
    //                         if (min - (halfW - ext) > $.minDist) {
    //                             balls.unshift({
    //                                 x: halfW - ext,
    //                                 y: right_ball.y,
    //                                 r: right_ball.r,
    //                                 computed: true,
    //                             });
    //                         } else if (halfW + ext - max > $.minDist) {
    //                             balls.push({
    //                                 x: halfW + ext,
    //                                 y: left_ball.y,
    //                                 r: left_ball.r,
    //                                 computed: true,
    //                             });
    //                         }
    //
    //                         _debugBallsLen('s', len, balls.length);
    //                     },
    //                     greet() {
    //                         $.debug('对称检测处理...');
    //                     },
    //                     getLeftBall() {
    //                         return balls.getFirstBall();
    //                     },
    //                     getRightBall() {
    //                         return balls.getLastBall();
    //                     },
    //                 };
    //             },
    //             linearInterpolateIFN() {
    //                 if (this.isLinearInterpolateAvail()) {
    //                     this.linearInterpolate();
    //                 }
    //             },
    //             isLinearInterpolateAvail() {
    //                 return Boolean($.config.houghResultsStrategy.linearInterpolate);
    //             },
    //             linearInterpolate() {
    //                 if (!_results_stg.linearInterpolate) {
    //                     return;
    //                 }
    //
    //                 _debug('线性插值处理...');
    //                 let _len = _balls.length;
    //
    //                 let _step = _getMinStep();
    //                 for (let i = 1; i < _balls.length; i += 1) {
    //                     let _dist = _calcDist(_balls[i], _balls[i - 1]);
    //                     let _cnt = Math.floor(_dist / _step - 0.75) + 1;
    //                     if (_cnt < 2) {
    //                         continue;
    //                     }
    //                     let _dx = _dist / _cnt;
    //                     let _dy = (_balls[i].y - _balls[i - 1].y) / _cnt;
    //                     let _data = [];
    //                     for (let k = 1; k < _cnt; k += 1) {
    //                         _data.push({
    //                             x: _balls[i - 1].x + _dx * k,
    //                             y: _balls[i - 1].y + _dy * k,
    //                             r: (_balls[i].r + _balls[i - 1].r) / 2,
    //                             computed: true,
    //                         });
    //                     }
    //                     _balls.splice.apply(_balls, [i, 0].concat(_data));
    //                     i += _data.length;
    //                 }
    //
    //                 _debugBallsLen('s', _len, _balls.length);
    //
    //                 // tool function(s) //
    //
    //                 function _getMinStep() {
    //                     let _step = Infinity;
    //                     _balls.forEach((v, i, a) => {
    //                         if (i) {
    //                             let _diff = _calcDist(a[i], a[i - 1]);
    //                             if (_diff < _step) {
    //                                 _step = _diff;
    //                             }
    //                         }
    //                     });
    //                     return _step;
    //                 }
    //
    //                 function _calcDist(p1, p2) {
    //                     return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
    //                 }
    //             },
    //             sort() {
    //                 this.data.sort(_.sortByX);
    //             },
    //             /**
    //              * @param {'standard'|'water'|'filtered'|string} name
    //              * @param {number} old_len
    //              * @param {number} [new_len]
    //              */
    //             debugLength(name, old_len, new_len) {
    //                 let $dl = {
    //                     debugInfo() {
    //                         this.parseArgs();
    //                         if (this.isLenChanged()) {
    //                             $.debug(`${this.name}: ${old_len} -> ${new_len}`);
    //                         } else {
    //                             $.debug(`${this.name}: ${old_len}`);
    //                         }
    //                     },
    //                     isLenChanged() {
    //                         return new_len !== undefined && old_len !== new_len;
    //                     },
    //                     parseArgs() {
    //                         this.parseName();
    //                     },
    //                     parseName() {
    //                         this.name = function getName$iiFe() {
    //                             switch (name) {
    //                                 case 'standard':
    //                                     return '标准能量球';
    //                                 case 'filtered':
    //                                     return '筛选能量球';
    //                                 case 'water':
    //                                     return '浇水回赠球';
    //                                 default:
    //                                     return name;
    //                             }
    //                         }();
    //                     },
    //                 };
    //
    //                 $dl.debugInfo();
    //             },
    //             debugAmount() {
    //                 let data = this.getClassified();
    //
    //                 let $da = {
    //                     debugInfo() {
    //                         this.debugTotal();
    //                         this.debugDetailsIFN();
    //                     },
    //                     debugTotal() {
    //                         let total = Object.values(data).reduce((a, b) => a + b.length, 0);
    //                         $.debug('解析的能量球数量: ' + total);
    //                     },
    //                     debugDetailsIFN() {
    //                         if (this.isNonEmpty()) {
    //                             this.debugDetails();
    //                         }
    //                     },
    //                     isNonEmpty() {
    //                         return Object.keys(data).length > 0;
    //                     },
    //                     debugDetails() {
    //                         let map = {ripe: '成熟', naught: '未成熟', water: '浇水'};
    //                         let mapper = k => `${map[k] || k} ×${data[k].length}`;
    //                         $.debug(Object.keys(data).map(mapper).join(' + '));
    //                     },
    //                 };
    //                 $da.debugInfo();
    //             },
    //         },
    //         getResult() {
    //             this.parseArgs();
    //             this.fillUpPool();
    //             this.addBallsIFN();
    //             this.cleanUp();
    //
    //             return this.assignData();
    //         },
    //         parseArgs() {
    //             this.options = options || {};
    //             this.debug = consolex.debug.fuel(this.options.isDebug);
    //
    //             this.config = Object.assign({}, _.defaultConfig, this.options.config);
    //             this.minDist = cX(this.config.minBallsDistance);
    //
    //             this.pool = this.options.pool || new exp.ForestImagePool({
    //                 limit: this.config.forestImagePoolLimit,
    //                 interval: this.config.forestImagePoolItv,
    //                 isDebug: this.options.isDebug,
    //             });
    //         },
    //         fillUpPool() {
    //             this.duration.fillUpPool = timersx.rec(
    //                 function fillUp$BouND() {
    //                     let max = this.pool.limit + 1;
    //                     while (max--) {
    //                         let et = timersx.rec(this.pool.add(this.options));
    //                         if (this.pool.isEmpty() || this.pool.isFilledUp()) {
    //                             break;
    //                         }
    //                         this.pool.intermit(et);
    //                     }
    //                 }.bind(this),
    //             );
    //         },
    //         addBallsIFN() {
    //             if (this.pool.isNonEmpty()) {
    //                 this.debug('分析森林页面样本中的能量球');
    //
    //                 this.debug.__('solid');
    //                 this.pool.data.forEach(capt => this.addBalls(capt));
    //                 this.debug.__('solid');
    //
    //                 this.debug('森林页面样本能量球分析完毕');
    //
    //                 this.balls.debugAmount();
    //             }
    //         },
    //         /**
    //          * @param {ImageWrapper$} capt
    //          * @return {void}
    //          */
    //         addBalls(capt) {
    //             let _p = {
    //                 region: (function $iiFe() {
    //                     let [l, t, r, b] = $.config.energyBallsRecognitionRegion.map((v, i) => {
    //                         return i % 2 ? cYx(v, true) : cX(v, true);
    //                     });
    //                     return {
    //                         left: l, top: t, right: r, bottom: b,
    //                         width: r - l, height: b - t,
    //                     };
    //                 })(),
    //             };
    //
    //             let $p = {
    //                 addBalls() {
    //                     this.parseArgs();
    //                 },
    //                 parseArgs() {
    //                     this.parseStrategies();
    //                 },
    //                 parseStrategies() {
    //                     let stg = $.config.houghSrcImageStrategy;
    //
    //                     this.isGrayscaleEnabled = () => Boolean(stg.grayscale);
    //                     this.isBlurEnabled = () => Boolean(stg.blur);
    //                     this.isMedianBlurEnabled = () => Boolean(stg.medianBlur);
    //                     this.isAdaptiveThresholdEnabled = () => Boolean(stg.adaptiveThreshold);
    //                     this.isBilateralFilterEnabled = () => Boolean(stg.bilateralFilter);
    //                 },
    //                 addBallsBAK() {
    //                     _debug('收集预处理数据...');
    //
    //                     let _wballs_total = _wballs.map(_wrapProps).filter(_filterNonActivityBtn);
    //                     _debugBallsLen('w', _wballs.length, _wballs_total.length);
    //                     _wballs_total.forEach(o => _addBall(o, 'water'));
    //
    //                     let _balls_total = _balls.map(_wrapProps).filter(_filterNonActivityBtn);
    //                     _debugBallsLen('s', _balls.length, _balls_total.length);
    //                     _balls_total.forEach((o) => {
    //                         if (_isRipeBall(o)) {
    //                             _addBall(o, 'ripe');
    //                         } else if (!exp.isBallInTreeArea(o)) {
    //                             _addBall(o, 'naught');
    //                         }
    //                     });
    //
    //                     // tool function(s) //
    //
    //                     function _isRipeBall(o) {
    //                         return exp.isRipeBall(o, {capt: capt});
    //                     }
    //
    //                     /**
    //                      * @param {AntForest.EnergyBall.Property} o
    //                      * @param {AntForest.EnergyBall.Type} type
    //                      */
    //                     function _addBall(o, type) {
    //                         let _weight = {ripe: 6, naught: 3};
    //                         let _data_idx = _getDataIdx(o);
    //                         if (_data_idx === -1) {
    //                             $.balls.addSingular(Object.assign({type: type}, o));
    //                         } else if (_weight[type] > _weight[_balls_data[_data_idx].type]) {
    //                             // low-priority data will be replaced with the one with higher priority
    //                             _balls_data[_data_idx] = Object.assign({type: type}, o);
    //                         }
    //
    //                         // tool function(s) //
    //
    //                         function _getDataIdx(o) {
    //                             let _l = _balls_data.length;
    //                             for (let i = 0; i < _l; i += 1) {
    //                                 // taken as identical balls
    //                                 if (Math.abs(o.x - _balls_data[i].x) < _minDist / 2) {
    //                                     return i;
    //                                 }
    //                             }
    //                             return -1;
    //                         }
    //                     }
    //
    //                     /**
    //                      * @param {AntForest.EnergyBall.Basic} o
    //                      * @return {AntForest.EnergyBall.Property}
    //                      */
    //                     function _wrapProps(o) {
    //                         return Object.assign(o, {
    //                             rect: new android.graphics.Rect(o.x - o.r, o.y - o.r, o.x + o.r, o.y + o.r),
    //                         });
    //                     }
    //
    //                     /**
    //                      * @param {AntForest.EnergyBall.Property} o
    //                      * @return {boolean}
    //                      */
    //                     function _filterNonActivityBtn(o) {
    //                         let _min_x = cX(118);
    //                         let _max_x = W - _min_x;
    //                         let _min_y = cYx(346);
    //
    //                         return o.rect.left > _min_x && o.rect.right < _max_x
    //                             || o.rect.top > _min_y;
    //                     }
    //                 },
    //                 parseData() {
    //                     this.parseRegion();
    //                 },
    //                 getImg(name, condition, imgGenerator) {
    //                     if (condition) {
    //                         timersx.rec.save(name);
    //                         let _img = imgGenerator();
    //                         let _et = timersx.rec(name);
    //                         _du[name] ? _du[name] = _et : _du[name] += _et;
    //                         _debug(`${_.map[name]}: ${_et}ms`);
    //                         return _img;
    //                     }
    //                     _debug(`${_.map[name]}: discarded`);
    //                 },
    //                 /**
    //                  * @return {AntForest.EnergyBall.Basic[]}
    //                  */
    //                 getBalls(img) {
    //                     if (!img) {
    //                         $.debug(`${_.map[name]}: discarded`);
    //                         return [];
    //                     }
    //                     timersx.rec.save(`${name}_cir`);
    //                     let _results = images
    //                         .findCircles(img, {
    //                             dp: 1,
    //                             minDst: $.minDist,
    //                             minRadius: cX(0.054),
    //                             maxRadius: cX(0.078),
    //                             param1: 15,
    //                             param2: 15,
    //                             region: [_l, _t, _w, _h],
    //                         })
    //                         .map((o) => {
    //                             // o.x and o.y are relative,
    //                             // yet x and y are absolute
    //                             let _x = Number(o.x + _l);
    //                             let _y = Number(o.y + _t);
    //                             let _r = o.radius;
    //                             let _d = _r * 2;
    //                             return {
    //                                 x: _x, y: _y, r: _r,
    //                                 mean: imagesx.getMean(imagesx.clip(capt, _x - _r, _y - _r, _d, _d)),
    //                             };
    //                         })
    //                         .filter((o) => {
    //                             return o.x - o.r >= _l
    //                                 && o.x + o.r <= _r
    //                                 && o.y - o.r >= _t
    //                                 && o.y + o.r <= _b
    //                                 // excluding homepage cloud(s)
    //                                 && o.mean.std > 20;
    //                         })
    //                         .sort(_.sortByX);
    //
    //                     imagesx.reclaim(img);
    //
    //                     _debug(_.map[name] + ':' + ' '
    //                         + _results.length + 'cir in' + ' '
    //                         + timersx.rec(name + '_cir') + 'ms');
    //
    //                     return _results;
    //                 },
    //                 filterNonWball(o) {
    //                     if (typeof o !== 'object' || isNullish(o)) {
    //                         _filtered.invalid += 1;
    //                         return false;
    //                     }
    //                     if (exp.isRipeBall(o, {capt: capt})) {
    //                         _filtered.ripe += 1;
    //                         return true;
    //                     }
    //                     if (exp.isWaterBall(o, {capt: capt})) {
    //                         _filtered.water += 1;
    //                         $.balls.add(o, 'water');
    //                         return false;
    //                     }
    //                     _filtered.naught += 1;
    //                     return true;
    //                 },
    //                 _() {
    //                     this.grayscale = images.grayscale(capt);
    //                     this.addBalls(this.getBalls(this.grayscale));
    //
    //                     if (this.isAdaptiveThresholdEnabled()) {
    //                         // new F().getBalls().addBalls().cleanUp();
    //                         this.addBalls(this.getBalls(images.adaptiveThreshold(this.grayscale, 255, 'GAUSSIAN_C', 'BINARY_INV', 9, 6)));
    //                     }
    //
    //                     if (this.isMedianBlurEnabled()) {
    //                         this.addBalls(this.getBalls(images.medianBlur(this.grayscale, 9)));
    //                     }
    //
    //                     if (this.isBlurEnabled()) {
    //                         this.addBalls(this.getBalls(images.blur(this.grayscale, 9, [-1, -1], 'REPLICATE')));
    //                     }
    //
    //                     if (this.isBilateralFilterEnabled()) {
    //                         this.addBalls(this.getBalls(images.bilateralFilter(this.grayscale, 9, 20, 20, 'REPLICATE')));
    //                     }
    //
    //                     if (!this.isGrayscaleEnabled()) {
    //                         imagesx.reclaim(this.grayscale);
    //                         delete this.grayscale;
    //                     }
    //                 },
    //             };
    //
    //             $p.addBalls();
    //
    //             let _proc_key = 'imgSamplesProcessing';
    //             timersx.rec.save(_proc_key);
    //
    //             /** @type {AntForest.EnergyBall.Basic[]} */
    //             let _wballs = [];
    //
    //             /** @type {AntForest.EnergyBall.Basic[]} */
    //             let _balls = [];
    //
    //             let _filtered = {invalid: 0, ripe: 0, water: 0, naught: 0};
    //             let _len_before_filter = _balls.length;
    //             _balls = _balls.filter(_filterNonWball);
    //             _debugBallsLen('筛选能量球', _len_before_filter, _balls.length);
    //             _debugBallsAmt(_filtered, {
    //                 invalid: '无效', ripe: '成熟', water: '浇水', naught: '未成熟',
    //             });
    //
    //             _balls.sort(_.sortByX);
    //
    //             if (_wballs.length + _balls.length) {
    //                 antiOverlap();
    //                 symmetrical();
    //                 linearInterpolate();
    //                 addBallsBAK();
    //             }
    //
    //             _du[_proc_key] = timersx.rec(_proc_key);
    //         },
    //         cleanUp() {
    //             if (typeof this.options.pool === 'object') {
    //                 this.pool.reclaimAll();
    //             }
    //         },
    //         assignData() {
    //             /** @type {AntForest.EnergyBall.Info.Duration} */
    //             let _du_o = {
    //                 duration: {
    //                     _map: [
    //                         ['grayscale', _.map.grayscale],
    //                         ['adaptiveThreshold', _.map.adaptiveThreshold],
    //                         ['medianBlur', _.map.medianBlur],
    //                         ['blur', _.map.blur],
    //                         ['bilateralFilter', _.map.bilateralFilter],
    //                         ['imgSamplesProcessing', '数据处理'],
    //                         ['total', '全部用时'],
    //                     ],
    //                     fillUpPool: _du.fillUpPool,
    //                     imgSamplesProcessing: _du.imgSamplesProcessing,
    //                     total: timersx.rec('houghBeginning'),
    //                     debug() {
    //                         _debug.__();
    //                         _debug('图像填池: ' + this.fillUpPool + 'ms  ' + [
    //                             _pool.interval, _pool.limit,
    //                         ].join(', ').surround('[ '));
    //                         this._map.forEach((a) => {
    //                             let [key, stg] = a;
    //                             if (this[key]) {
    //                                 _debug(stg + ': ' + this[key] + 'ms');
    //                             }
    //                         });
    //                         _debug.__();
    //                     },
    //                 },
    //             };
    //
    //             /** @type {AntForest.EnergyBall.Info.Extension} */
    //             let _ext = {
    //                 expand() {
    //                     return Object.values(this)
    //                         .filter(val => Array.isArray(val))
    //                         .reduce((a1, a2) => a1.concat(a2), Array())
    //                         .sort(_.sortByX);
    //                 },
    //                 digest() {
    //                     let _data = {};
    //                     Object.values(this)
    //                         .filter(val => Array.isArray(val))
    //                         .forEach(a => a.forEach((o) => {
    //                             let _digest = [o.x, o.y];
    //                             o.computed && _digest.push('computed');
    //                             if (o.type in _data) {
    //                                 _data[o.type].push(_digest);
    //                             } else {
    //                                 _data[o.type] = [_digest];
    //                             }
    //                         }));
    //                     Object.values(_data).forEach(a => a.sort(_.sortByX));
    //                     return _data;
    //                 },
    //             };
    //
    //             return Object.assign({}, _balls_data_o, _du_o, _ext);
    //         },
    //     };
    //
    //     return $.getResult();
    // },
    findEnergyBalls(options) {
        timersx.rec.save('hough_beginning');

        let _opt = options || {};
        let _debug = consolex.debug.fuel(_opt);

        let _opt_cfg = _opt.config || {};
        let _cfg = Object.assign(_def(), global.$$cfg, {
            forest_image_pool_limit: _opt_cfg.forest_image_pool_limit,
            forest_image_pool_itv: _opt_cfg.forest_image_pool_itv,
        });

        let _src_img_stg = _cfg.hough_src_img_strategy;
        let _results_stg = _cfg.hough_results_strategy;
        let _min_dist = cX(_cfg.min_balls_distance);
        let _region = _opt.region || _cfg.eballs_recognition_region
            .map((v, i) => i % 2 ? cYx(v, true) : cX(v, true));

        let _stg_name_map = {
            gray: '灰度化',
            adapt_thrd: '自适应阈值',
            med_blur: '中值滤波',
            blur: '均值滤波',
            blt_fltr: '双边滤波',
        };

        /** @type {typeof Imagesx.EnergyBall.Info.Duration.duration} */
        let _du = {};
        /** @type {Imagesx.EnergyBall.Infos} */
        let _balls_data = [];
        /** @type {Imagesx.EnergyBall.Info.Classified} */
        let _balls_data_o = {ripe: [], naught: [], water: []};
        let _pool = _opt.pool || new this.ForestImagePool({
            limit: _cfg.forest_image_pool_limit,
            interval: _cfg.forest_image_pool_itv,
            isDebug: _opt.isDebug,
        });
        _setWballExtFunction();
        _fillUpForestImgPool();
        _analyseEnergyBalls();

        /** @type {Imagesx.EnergyBall.Info.Duration} */
        let _du_o = _opt.duration === false ? {} : {
            duration: {
                _map: [
                    ['gray', _stg_name_map.gray],
                    ['adapt_thrd', _stg_name_map.adapt_thrd],
                    ['med_blur', _stg_name_map.med_blur],
                    ['blur', _stg_name_map.blur],
                    ['blt_fltr', _stg_name_map.blt_fltr],
                    ['img_samples_processing', '数据处理'],
                    ['total', '全部用时'],
                ],
                fill_up_pool: _du.fill_up_pool,
                img_samples_processing: _du.img_samples_processing,
                total: timersx.rec('hough_beginning'),
                debug() {
                    _debug.__();
                    _debug('图像填池: ' + this.fill_up_pool + 'ms\x20\x20' + [
                        _pool.interval, _pool.limit,
                    ].join(', ').surround('[ '));
                    this._map.forEach((a) => {
                        let [key, stg] = a;
                        if (this[key]) {
                            _debug(stg + ':\x20' + this[key] + 'ms');
                        }
                    });
                    _debug.__();
                },
            },
        };

        /** @type {Imagesx.EnergyBall.Info.Extension} */
        let _ext = {
            expand() {
                return Object.values(this)
                    .filter(val => Array.isArray(val))
                    .reduce((a1, a2) => a1.concat(a2), Array())
                    .sort(_sortX);
            },
            digest() {
                let _data = {};
                Object.values(this)
                    .filter(val => Array.isArray(val))
                    .forEach(a => a.forEach((o) => {
                        let _digest = [o.x, o.y];
                        o.computed && _digest.push('computed');
                        if (o.type in _data) {
                            _data[o.type].push(_digest);
                        } else {
                            _data[o.type] = [_digest];
                        }
                    }));
                Object.values(_data).forEach(a => a.sort(_sortX));
                return _data;
            },
        };

        return Object.assign(_balls_data_o, _du_o, _ext);

        // tool function(s) //

        function _setWballExtFunction() {
            if (!exp.inTreeArea) {
                exp.inTreeArea = (o) => {
                    // TODO...
                    let _tree_area = {x: halfW, y: cYx(670), r: cX(182)};
                    if (typeof o !== 'object' || !o.r) {
                        throw Error('inTreeArea() invoked with invalid arguments');
                    }
                    let {x: _ox, y: _oy, r: _or} = o;
                    let {x: _zx, y: _zy, r: _zr} = _tree_area;
                    let _ct_dist_min = _or + _zr;
                    let _ct_dist = Math.sqrt(Math.pow(_zy - _oy, 2) + Math.pow(_zx - _ox, 2));
                    return _ct_dist < _ct_dist_min;
                };
            }
            if (!exp.isWaterBall) {
                exp.isWaterBall = (o, capt, container) => {
                    let {x: _ctx, y: _cty} = o;
                    if (_cty > cYx(386)) {
                        return false;
                    }
                    let _capt = capt || imagesx.capt(options);
                    let _hue_max = _cfg.homepage_wball_max_hue_no_blue;
                    let _offset_x = o.r * Math.sin(30 * Math.PI / 180);
                    let _offset_y = o.r * Math.cos(30 * Math.PI / 180);
                    let _x_min = _ctx - _offset_x;
                    let _y_min = _cty - _offset_y;
                    let _x_max = _ctx + _offset_x;
                    let _y_max = _cty + _offset_y;
                    let _step = 2;
                    return _progress(_x_min, _step, _y_min, _step);

                    // tool function(s) //

                    function _progress(x_min, x_step, y_min, y_step) {
                        while (x_min <= _x_max && y_min <= _y_max) {
                            if (_hit(x_min, y_min)) {
                                if (Array.isArray(container)) {
                                    container.push(o);
                                }
                                return true;
                            }
                            x_min += x_step;
                            y_min += y_step;
                        }
                    }

                    function _hit(x, y) {
                        let _col = images.pixel(_capt, x, y);
                        let _red = colors.red(_col);
                        let _green = colors.green(_col);
                        // hue value in HSB mode without blue component
                        let _hue = 120 - (_red / _green) * 60;
                        if (isFinite(_hue) && _hue < _hue_max) {
                            return true;
                        }
                    }
                };
            }
            if (!exp.isRipeBall) {
                exp.isRipeBall = (o, {capt, container}) => {
                    if (exp.inTreeArea(o)) {
                        return;
                    }
                    let _capt = capt || imagesx.capt(options);
                    let _offset = o.r * Math.SQRT1_2;
                    let _d = _offset * 2;
                    let _color = _cfg.ripe_ball_detect_color_val;
                    let _result = images.findColor(_capt, _color, {
                        region: [o.x - _offset, o.y - _offset, _d, _d],
                        threshold: _cfg.ripe_ball_detect_threshold,
                    });

                    if (_result) {
                        if (Array.isArray(container)) {
                            container.push(o);
                        }
                        return true;
                    }
                };
            }
        }

        function _fillUpForestImgPool() {
            timersx.rec.save('fill_up_pool');
            let _max = _pool.limit + 1;
            while (_max--) {
                timersx.rec.save('forest_pool_add');
                _pool.add(options);
                if (!_pool.len || _pool.filled_up) {
                    break;
                }
                sleep(_pool.interval - timersx.rec('forest_pool_add'));
            }
            _du.fill_up_pool = timersx.rec('fill_up_pool');
        }

        function _analyseEnergyBalls() {
            _debug('分析森林页面样本中的能量球');
            _pool.data.filter(i => !imagesx.isRecycled(i)).forEach(_parse);

            _debug('森林页面样本能量球分析完毕');
            _debug('解析的能量球数量: ' + _balls_data.length);
            _balls_data.forEach(o => _balls_data_o[o.type].push(o));
            _debugBallsAmt(_balls_data_o, {
                ripe: '成熟', naught: '未成熟', water: '浇水',
            });

            _opt.pool || _pool.reclaimAll();

            // tool function(s) //

            function _parse(capt, idx) {
                idx || _debug.__();

                let [_l, _t, _r, _b] = _region;
                let [_w, _h] = [_r - _l, _b - _t];

                let _gray = _getImg('gray', true, () => {
                    return images.grayscale(capt);
                });
                let _adapt_thrd = _getImg('adapt_thrd', _src_img_stg.adapt_thrd, () => {
                    return images.adaptiveThreshold(_gray, 255, 'GAUSSIAN_C', 'BINARY_INV', 9, 6);
                });
                let _med_blur = _getImg('med_blur', _src_img_stg.med_blur, () => {
                    return images.medianBlur(_gray, 9);
                });
                let _blur = _getImg('blur', _src_img_stg.blur, () => {
                    return images.blur(_gray, 9, [-1, -1], 'REPLICATE');
                });
                let _blt_fltr = _getImg('blt_fltr', _src_img_stg.blt_fltr, () => {
                    return images.bilateralFilter(_gray, 9, 20, 20, 'REPLICATE');
                });

                if (!_src_img_stg.gray) {
                    imagesx.reclaim(_gray);
                    _gray = null;
                }

                let _proc_key = 'img_samples_processing';
                timersx.rec.save(_proc_key);

                /** @type {Imagesx.EnergyBall.BasicProp[]} */
                let _wballs = [];

                /** @type {Imagesx.EnergyBall.BasicProp[]} */
                let _balls = []
                    .concat(_getBalls('gray', _gray))
                    .concat(_getBalls('adapt_thrd', _adapt_thrd))
                    .concat(_getBalls('med_blur', _med_blur))
                    .concat(_getBalls('blur', _blur))
                    .concat(_getBalls('blt_fltr', _blt_fltr));

                let _filtered = {invalid: 0, ripe: 0, water: 0, naught: 0};
                let _len_before_filter = _balls.length;
                _balls = _balls.filter(_filterNonWball);
                _debugBallsLen('筛选能量球', _len_before_filter, _balls.length);
                _debugBallsAmt(_filtered, {
                    invalid: '无效', ripe: '成熟', water: '浇水', naught: '未成熟',
                });

                _balls.sort(_sortX);

                if (_wballs.length + _balls.length) {
                    _antiOverlap();
                    _symmetrical();
                    _linearInterpolate();
                    _addBalls();
                }

                _du[_proc_key] = timersx.rec(_proc_key);

                _debug.__();

                // tool function(s) //

                function _getImg(name, condition, imgGenerator) {
                    if (condition) {
                        timersx.rec.save(name);
                        let _img = imgGenerator();
                        let _et = timersx.rec(name);
                        _du[name] ? _du[name] = _et : _du[name] += _et;
                        _debug(_stg_name_map[name] + ':\x20' + _et + 'ms');
                        return _img;
                    }
                    _debug(_stg_name_map[name] + ': discarded');
                }

                function _antiOverlap() {
                    if (_results_stg.anti_ovl) {
                        _debug('覆盖检测处理...');

                        let _len_w = _wballs.length;
                        let _len_s = _balls.length;

                        _antiX(_balls);
                        _antiX(_wballs);
                        _antiXY(_balls, _wballs);

                        _debugBallsLen('w', _len_w, _wballs.length);
                        _debugBallsLen('s', _len_s, _balls.length);
                    }

                    // tool function(s) //

                    function _antiX(a) {
                        if (a.length < 2) {
                            return;
                        }
                        let _tmp = [[a[0]]];
                        for (let i = 1, l = a.length; i < l; i += 1) {
                            let _last_a = _tmp[_tmp.length - 1];
                            let _last_item = _last_a[_last_a.length - 1];
                            if (a[i].x - _last_item.x < _min_dist) {
                                _last_a.push(a[i]);
                            } else {
                                _tmp.push([a[i]]);
                            }
                        }
                        [].splice.apply(a, [0, a.length].concat(_tmp.map((a) => {
                            a.sort(_sortX);
                            let _med = a[Math.floor(a.length / 2)];
                            let _rebuilt = {
                                x: _getReasonable(a.map(o => o.x)),
                                y: _getReasonable(a.map(o => o.y)),
                                r: _getReasonable(a.map(o => o.r)),
                            };
                            return Object.assign(_med, _rebuilt);
                        })));
                    }

                    function _antiXY(sample, ref) {
                        let _chkSample = (smp, ref, i) => {
                            let _cond_x = Math.abs(ref.x - smp.x) < _min_dist;
                            let _cond_y = Math.abs(ref.y - smp.y) < _min_dist;
                            if (_cond_x && _cond_y) {
                                sample.splice(i--, 1);
                            }
                        };

                        if (ref) {
                            return ref.forEach((_ref) => {
                                for (let i = 0; i < sample.length; i += 1) {
                                    _chkSample(sample[i], _ref, i);
                                }
                            });
                        }
                        for (let i = 1; i < sample.length; i += 1) {
                            _chkSample(sample[i - 1], sample[i], i);
                        }
                    }

                    function _getReasonable(a, min_same) {
                        let _min_same = typeof min_same === 'number' ? min_same : cX(9);
                        let _a = [[]];
                        a.slice().sort((a, b) => {
                            let _a = Number(a);
                            let _b = Number(b);
                            return _a === _b ? 0 : _a > _b ? 1 : -1;
                        }).forEach((x) => {
                            let _last_a = _a[_a.length - 1];
                            if (!_last_a.length) {
                                _last_a.push(x);
                            } else {
                                let _last_item = _last_a[_last_a.length - 1];
                                if (x - _last_item < _min_same) {
                                    _last_a.push(x);
                                } else {
                                    _a.push([x]);
                                }
                            }
                        });
                        _a.sort((a1, a2) => {
                            let _a = a1.length;
                            let _b = a2.length;
                            return _a === _b ? 0 : _a < _b ? 1 : -1;
                        });
                        for (let i = 1, l = _a.length; i < l; i += 1) {
                            if (_a[i].length < _a[i - 1].length) {
                                _a.splice(i);
                                break;
                            }
                        }
                        if (_a.length > 1) {
                            _a.sort((o1, o2) => {
                                let _a = Math.std(o1);
                                let _b = Math.std(o2);
                                return _a === _b ? 0 : _a > _b ? 1 : -1;
                            });
                        }
                        return Math.median(_a[0]);
                    }
                }

                function _symmetrical() {
                    if (!_results_stg.symmetrical || !_balls.length) {
                        return;
                    }
                    if (_balls.length === 1) {
                        let {x: _x} = _balls[0];
                        if (Math.abs(_x - halfW) <= _min_dist) {
                            return;
                        }
                    }

                    _debug('对称检测处理...');
                    let _len = _balls.length;

                    let _right_ball = _balls[_balls.length - 1];
                    let _left_ball = _balls[0];
                    let _max = _right_ball.x;
                    let _min = _left_ball.x;
                    let _ext = Math.max(_max - halfW, halfW - _min);
                    if (_min - (halfW - _ext) > _min_dist) {
                        _balls.unshift({
                            x: halfW - _ext,
                            y: _right_ball.y,
                            r: _right_ball.r,
                            computed: true,
                        });
                    } else if (halfW + _ext - _max > _min_dist) {
                        _balls.push({
                            x: halfW + _ext,
                            y: _left_ball.y,
                            r: _left_ball.r,
                            computed: true,
                        });
                    }

                    _debugBallsLen('s', _len, _balls.length);
                }

                function _linearInterpolate() {
                    if (!_results_stg.linear_itp) {
                        return;
                    }

                    _debug('线性插值处理...');
                    let _len = _balls.length;

                    let _step = _getMinStep();
                    for (let i = 1; i < _balls.length; i += 1) {
                        let _dist = _calcDist(_balls[i], _balls[i - 1]);
                        let _cnt = Math.floor(_dist / _step - 0.75) + 1;
                        if (_cnt < 2) {
                            continue;
                        }
                        let _dx = _dist / _cnt;
                        let _dy = (_balls[i].y - _balls[i - 1].y) / _cnt;
                        let _data = [];
                        for (let k = 1; k < _cnt; k += 1) {
                            _data.push({
                                x: _balls[i - 1].x + _dx * k,
                                y: _balls[i - 1].y + _dy * k,
                                r: (_balls[i].r + _balls[i - 1].r) / 2,
                                computed: true,
                            });
                        }
                        _balls.splice.apply(_balls, [i, 0].concat(_data));
                        i += _data.length;
                    }

                    _debugBallsLen('s', _len, _balls.length);

                    // tool function(s) //

                    function _getMinStep() {
                        let _step = Infinity;
                        _balls.forEach((v, i, a) => {
                            if (i) {
                                let _diff = _calcDist(a[i], a[i - 1]);
                                if (_diff < _step) {
                                    _step = _diff;
                                }
                            }
                        });
                        return _step;
                    }

                    function _calcDist(p1, p2) {
                        return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
                    }
                }

                function _addBalls() {
                    _debug('收集预处理数据...');

                    let _wballs_total = _wballs.map(_wrapProps).filter(_filterNonActivityBtn);
                    _debugBallsLen('w', _wballs.length, _wballs_total.length);
                    _wballs_total.forEach(o => _addBall(o, 'water'));

                    let _balls_total = _balls.map(_wrapProps).filter(_filterNonActivityBtn);
                    _debugBallsLen('s', _balls.length, _balls_total.length);
                    _balls_total.forEach((o) => {
                        if (_isRipeBall(o)) {
                            _addBall(o, 'ripe');
                        } else if (!exp.inTreeArea(o)) {
                            _addBall(o, 'naught');
                        }
                    });

                    // tool function(s) //

                    function _isRipeBall(o) {
                        return exp.isRipeBall(o, {capt});
                    }

                    /**
                     * @param {Imagesx.EnergyBall.Property} o
                     * @param {Imagesx.EnergyBall.Type} type
                     */
                    function _addBall(o, type) {
                        let _pri = {ripe: 6, naught: 3};
                        let _data_idx = _getDataIdx(o);
                        if (_data_idx === -1) {
                            _balls_data.push(Object.assign({type: type}, o));
                        } else if (_pri[type] > _pri[_balls_data[_data_idx].type]) {
                            // low-priority data will be replaced with the one with higher priority
                            _balls_data[_data_idx] = Object.assign({type: type}, o);
                        }

                        // tool function(s) //

                        function _getDataIdx(o) {
                            let _l = _balls_data.length;
                            for (let i = 0; i < _l; i += 1) {
                                // taken as identical balls
                                if (Math.abs(o.x - _balls_data[i].x) < _min_dist / 2) {
                                    return i;
                                }
                            }
                            return -1;
                        }
                    }

                    /** @return {Imagesx.EnergyBall.Property} */
                    function _wrapProps(o) {
                        let _toFixedNum = (x, frac) => {
                            return Number(Number(x).toFixed(typeof frac === 'number' ? frac : 1));
                        };
                        ['x', 'y', 'r'].forEach(k => o[k] = _toFixedNum(o[k]));
                        let {x: _x, y: _y, r: _r} = o;
                        return Object.assign(o, {
                            left: _toFixedNum(_x - _r),
                            top: _toFixedNum(_y - _r),
                            right: _toFixedNum(_x + _r),
                            bottom: _toFixedNum(_y + _r),
                            // width and height were made functional
                            // just for better compatible with Auto.js
                            width: () => _r * 2,
                            height: () => _r * 2,
                        });
                    }

                    function _filterNonActivityBtn(o) {
                        let _x = cX(118), _y = cYx(346);

                        let _inArea = o => o.left > _x || o.top > _y;
                        let _inSymArea = o => o.right < W - _x || o.top > _y;

                        return _inArea(o) && _inSymArea(o);
                    }
                }

                /**
                 * @return {Imagesx.EnergyBall.BasicProp[]}
                 */
                function _getBalls(name, img) {
                    if (!img) {
                        _debug(_stg_name_map[name] + ': discarded');
                        return [];
                    }
                    timersx.rec.save(name + '_cir');
                    let _results = images
                        .findCircles(img, {
                            dp: 1,
                            minDist: _min_dist,
                            minRadius: cX(0.054),
                            maxRadius: cX(0.078),
                            param1: 15,
                            param2: 15,
                            region: [_l, _t, _w, _h],
                        })
                        .map((o) => {
                            // o.x and o.y are relative,
                            // yet x and y are absolute
                            let _x = Number(o.x + _l);
                            let _y = Number(o.y + _t);
                            let _r = o.radius.toFixedNum(2);
                            let _d = _r * 2;
                            let _clip = images.clip(capt, _x - _r, _y - _r, _d, _d);
                            let _mean = imagesx.getMean(_clip);
                            _clip.recycle();
                            _clip = null;
                            return {x: _x, y: _y, r: _r, mean: _mean};
                        })
                        .filter((o) => {
                            return o.x - o.r >= _l
                                && o.x + o.r <= _r
                                && o.y - o.r >= _t
                                && o.y + o.r <= _b
                                // excluding homepage cloud(s)
                                && o.mean.std > 20;
                        })
                        .sort(_sortX);
                    imagesx.reclaim(img);

                    let _et = timersx.rec(name + '_cir');
                    _debug(_stg_name_map[name] + ':\x20' + _results.length + 'cir in\x20' + _et + 'ms');

                    return _results;
                }

                function _filterNonWball(o) {
                    if (typeof o !== 'object' || isNullish(o)) {
                        _filtered.invalid += 1;
                        return false;
                    }
                    if (exp.isRipeBall(o, {capt})) {
                        _filtered.ripe += 1;
                        return true;
                    }
                    if (exp.isWaterBall(o, capt, _wballs)) {
                        _filtered.water += 1;
                        return false;
                    }
                    _filtered.naught += 1;
                    return true;
                }
            }
        }

        function _sortX(a, b) {
            return a.x === b.x ? 0 : a.x > b.x ? 1 : -1;
        }

        // updated: Oct 20, 2020
        function _def() {
            return {
                ripe_ball_detect_color_val: '#DEFF00',
                ripe_ball_detect_threshold: 13,
                eballs_recognition_region: [0.1, 0.15, 0.9, 0.45],
                hough_src_img_strategy: {
                    gray: true, adapt_thrd: true, med_blur: true, blur: true,
                    blt_fltr: false,
                },
                hough_results_strategy: {
                    anti_ovl: true, symmetrical: true, linear_itp: true,
                },
                min_balls_distance: 0.09,
                forest_image_pool_limit: 3,
                forest_image_pool_itv: 60,
                homepage_wball_max_hue_no_blue: 47,
            };
        }

        /**
         * @param {'s'|'w'|string} name
         * @param {number} old_len
         * @param {number} [new_len]
         */
        function _debugBallsLen(name, old_len, new_len) {
            let _n = name === 's' ? '标准能量球' : name === 'w' ? '浇水回赠球' : name;
            new_len === undefined || old_len === new_len
                ? _debug(_n + ':\x20' + old_len)
                : _debug(_n + ':\x20' + old_len + ' -> ' + new_len);
        }

        /**
         * @param {Object} data
         * @param {Object} [mapper]
         */
        function _debugBallsAmt(data, mapper) {
            let _keys = Object.keys(data);
            let _map = mapper || {};
            let _len = x => Array.isArray(x) ? x.length : x;
            _keys = _keys.filter(k => _len(data[k]) > 0);
            _keys.length && _debug(_keys
                .map(k => (_map[k] || k) + '×\x20' + _len(data[k]))
                .join(' + '));
        }
    },
    // /**
    //  * @param {AntForest.EnergyBall.Property} ball
    //  * @param {{
    //  *     capt?: ImageWrapper$,
    //  *     isDebug?: boolean,
    //  *     config?: {
    //  *         ripeBallDetectColorVal: Color$,
    //  *         ripeBallDetectThreshold: number,
    //  *     },
    //  * }} options
    //  * @return {boolean}
    //  */
    // isRipeBall(ball, options) {
    //     let $ = {
    //         options: options || {},
    //         getResult() {
    //             if (this.trigger()) {
    //                 this.parseArgs();
    //                 if (this.findColor()) {
    //                     return true;
    //                 }
    //             }
    //             return false;
    //         },
    //         trigger() {
    //             return exp.isBallInTreeArea(ball);
    //         },
    //         parseArgs() {
    //             this.capt = this.options.capt || imagesx.capt({isDebug: this.options.isDebug});
    //             this.config = this.options.config || {};
    //             this.color = this.config.ripeBallDetectColorVal;
    //         },
    //         findColor() {
    //             return imagesx.findColor(this.capt, this.color, {
    //                 region: ball.rect,
    //                 threshold: this.config.ripeBallDetectThreshold,
    //             });
    //         },
    //     };
    //
    //     return $.getResult();
    // },
    // /**
    //  * @param {AntForest.EnergyBall.Property} ball
    //  * @param {{
    //  *     capt?: ImageWrapper$,
    //  *     isDebug?: boolean,
    //  *     config?: {
    //  *         homepageWaterBallMaxHueNoBlue?: number,
    //  *     },
    //  * }} [options]
    //  * @return {boolean}
    //  */
    // isWaterBall(ball, options) {
    //     let _ = {
    //         config: {
    //             maxAreaBottom: cYx(450),
    //             scanAngle: 30, // degree, relative to axis y
    //             scanStep: 2,
    //         },
    //     };
    //
    //     let $ = {
    //         options: options || {},
    //         getResult() {
    //             if (this.trigger()) {
    //                 this.parseArgs();
    //                 if (this.hitColor()) {
    //                     return true;
    //                 }
    //             }
    //             return false;
    //         },
    //         trigger() {
    //             return ball.rect.bottom < _.config.maxAreaBottom;
    //         },
    //         parseArgs() {
    //             this.capt = this.options.capt || imagesx.capt({isDebug: this.options.isDebug});
    //             this.config = this.options.config || {};
    //             this.parseScanner();
    //         },
    //         parseScanner() {
    //             let ratio = function $iiFe() {
    //                 let radian = _.config.scanAngle * Math.PI / 180;
    //                 return {
    //                     x: Math.sin(radian),
    //                     y: Math.cos(radian),
    //                 };
    //             }();
    //             let offset = {
    //                 x: ball.r * ratio.x,
    //                 y: ball.r * ratio.y,
    //             };
    //             this.scanner = {
    //                 pointer: {
    //                     x: ball.x - offset.x,
    //                     y: ball.y - offset.y,
    //                 },
    //                 isWithinLimit() {
    //                     let max = {
    //                         x: ball.x + offset.x,
    //                         y: ball.y + offset.y,
    //                     };
    //                     return (this.isWithinLimit = function $LazY() {
    //                         return this.pointer.x <= max.x
    //                             && this.pointer.y <= max.y;
    //                     }.bind(this))();
    //                 },
    //                 stepUp() {
    //                     let step = {
    //                         x: _.config.scanStep * ratio.x,
    //                         y: _.config.scanStep * ratio.y,
    //                     };
    //                     return (this.stepUp = function $LazY() {
    //                         this.pointer.x += step.x;
    //                         this.pointer.y += step.y;
    //                     }.bind(this))();
    //                 },
    //             };
    //         },
    //         hitColor() {
    //             while (this.scanner.isWithinLimit()) {
    //                 if (this.isColorHit(this.scanner.pointer)) {
    //                     return true;
    //                 }
    //                 this.scanner.stepUp();
    //             }
    //             return false;
    //         },
    //         isColorHit(pointer) {
    //             let color = images.pixel(this.capt, pointer.x, pointer.y);
    //             // hue value in HSB mode without blue component
    //             let hue = 120 - (colors.red(color) / colors.green(color)) * 60;
    //             return isFinite(hue) && hue < this.config.homepageWaterBallMaxHueNoBlue;
    //         },
    //     };
    //
    //     return $.getResult();
    // },
    isBallInTreeArea(ball) {
        let _ = {
            config: {
                treeArea: {x: $$disp.halfW, y: cYx(670), r: cX(182)},
            },
        };

        let $ = {
            getResult() {
                this.checkArgs();
                this.parseArgs();
                return this.distPts < this.distMax;
            },
            checkArgs() {
                if (typeof ball !== 'object' || !ball.r) {
                    throw Error('afrst.isBallInTreeArea() invoked with invalid arguments');
                }
            },
            parseArgs() {
                this.tree = _.config.treeArea;
                this.distPts = Math.dist(ball, this.tree);
                this.distMax = ball.r + this.tree.r;
            },
        };

        return $.getResult();
    },
};

module.exports = {afrst: exp};