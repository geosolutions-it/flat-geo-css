/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
    read
} from './flat-geo-css';

describe('read flat geo css', function() {
    it('should read all selector', function() {
        const STYLE = `
        @mode 'Flat';
        * {
            fill: #aaff33;
            stroke: #333333;
            stroke-width: 4;
        }`;
        const style = read(STYLE);
        expect(style.rules.length).toBe(1);
        expect(style.rules[0].selector).toBe('*');
        expect(style).toBe();
    });
    it('should read min scale selector', function() {
        const STYLE = `
        @mode 'Flat';
        [@sd > 50000] {
            fill: #aaff33;
        }
        [@scale > 50000] {
            fill: #aaff33;
        }
        [@sd > 50k] {
            fill: #aaff33;
        }
        [@sd > 1M] {
            fill: #aaff33;
        }
        [@sd > 1G] {
            fill: #aaff33;
        }
        [@sd >= 1G] {
            fill: #aaff33;
        }`;
        const style = read(STYLE);
        expect(style.rules.length).toBe(6);
        expect(style.rules[0]['min-scale']).toStrictEqual(['>', ['get', '@sd'], 50000]);
        expect(style.rules[1]['min-scale']).toStrictEqual(['>', ['get', '@scale'], 50000]);
        expect(style.rules[2]['min-scale']).toStrictEqual(['>', ['get', '@sd'], ['measure', 50, 'k']]);
        expect(style.rules[3]['min-scale']).toStrictEqual(['>', ['get', '@sd'], ['measure', 1, 'M']]);
        expect(style.rules[4]['min-scale']).toStrictEqual(['>', ['get', '@sd'], ['measure', 1, 'G']]);
        expect(style.rules[5]['min-scale']).toStrictEqual(['>=', ['get', '@sd'], ['measure', 1, 'G']]);
    });
    it('should read max scale selector', function() {
        const STYLE = `
        @mode 'Flat';
        [@sd < 50000] {
            fill: #aaff33;
        }
        [@scale < 50000] {
            fill: #aaff33;
        }
        [@sd < 50k] {
            fill: #aaff33;
        }
        [@sd < 1M] {
            fill: #aaff33;
        }
        [@sd < 1G] {
            fill: #aaff33;
        }
        [@sd <= 1G] {
            fill: #aaff33;
        }`;
        const style = read(STYLE);
        expect(style.rules.length).toBe(6);
        expect(style.rules[0]['max-scale']).toStrictEqual(['<', ['get', '@sd'], 50000]);
        expect(style.rules[1]['max-scale']).toStrictEqual(['<', ['get', '@scale'], 50000]);
        expect(style.rules[2]['max-scale']).toStrictEqual(['<', ['get', '@sd'], ['measure', 50, 'k']]);
        expect(style.rules[3]['max-scale']).toStrictEqual(['<', ['get', '@sd'], ['measure', 1, 'M']]);
        expect(style.rules[4]['max-scale']).toStrictEqual(['<', ['get', '@sd'], ['measure', 1, 'G']]);
        expect(style.rules[5]['max-scale']).toStrictEqual(['<=', ['get', '@sd'], ['measure', 1, 'G']]);
    });
    it('should read ecql selector', function() {
        const STYLE = `
        @mode 'Flat';
        [type = 'building'],
        [type <> 'green'],
        [count < 25],
        [count > 5],
        [area <= 50],
        [area >= 0],
        [class in ('roads', 'bridge')],
        [index not in (3, 4)],
        [class = 'roads'][type = 'primary'],
        [class = 'roads' and type = 'primary'],
        [class = 'roads' or type = 'primary'] {
            fill: #aaff33;
        }`;
        const style = read(STYLE);
        expect(style.rules.length).toBe(1);
        expect(style.rules[0].selector).toStrictEqual(
            ['any',
                ['all', ['==', ['get', 'type'], 'building']],
                ['all', ['!=', ['get', 'type'], 'green']],
                ['all', ['<', ['get', 'count'], 25]],
                ['all', ['>', ['get', 'count'], 5]],
                ['all', ['<=', ['get', 'area'], 50]],
                ['all', ['>=', ['get', 'area'], 0]],
                ['all', ['in', ['get', 'class'], ['literal', ['roads', 'bridge']]]],
                ['all', ['!', ['in', ['get', 'index'], ['literal', [3, 4]]]]],
                ['all',
                    ['==', ['get', 'class'], 'roads'],
                    ['==', ['get', 'type'], 'primary']
                ],
                ['all',
                    [
                        'all',
                        ['==', ['get', 'class'], 'roads'],
                        ['==', ['get', 'type'], 'primary']
                    ]
                ],
                ['all',
                    [
                        'any',
                        ['==', ['get', 'class'], 'roads'],
                        ['==', ['get', 'type'], 'primary']
                    ]
                ]
            ]);
    });
    it('should read type name selector', function() {
        const STYLE = `
        @mode 'Flat';
        layer {
            * {
                fill: #33ffaa;
            };
        }`;
        const style = read(STYLE);
        expect(style.rules.length).toBe(1);
        expect(style.rules[0].layer).toBe('layer');
    });
    it('should read pseudo selector', function() {
        const STYLE = `
        @mode 'Flat';
        * {
            mark: url('path/to/url');
            :mark {
                fill: #f2f2f2;
                stroke: #333333;
            };
        }`;
        const style = read(STYLE);
        expect(style.rules.length).toBe(1);
        expect(style.rules[0].properties[':mark'].fill).toStrictEqual(['hex', '#f2f2f2']);
        expect(style.rules[0].properties[':mark'].stroke).toStrictEqual(['hex', '#333333']);
    });
    it('should read numbered pseudo selector', function() {
        const STYLE = `
        @mode 'Flat';
        * {
            mark: url('path/to/url/1'), url('path/to/url/2');
            :nth-mark(1) {
                fill: #f2f2f2;
                stroke: #333333;
            };
        }`;
        const style = read(STYLE);
        expect(style.rules.length).toBe(2);
        expect(style.rules[0].properties[':mark'].fill).toStrictEqual(['hex', '#f2f2f2']);
        expect(style.rules[0].properties[':mark'].stroke).toStrictEqual(['hex', '#333333']);
        expect(style.rules[1].properties[':mark']).toBeFalsy();
    });
});
