# flat-geo-css

This package translates a flat geocss encoding to a json structure and vice versa.

- [GeoCSS documentation](https://docs.geoserver.org/stable/en/user/styling/css/index.html)

## Examples

- From geocss encoding to json structure example
```js
import flatGeoCSS from 'flat-geo-css';

const geoCSSJSON = flatGeoCSS.read(`
@mode 'Flat';
* {
    fill: #aaff33;
    stroke: #333333;
    stroke-width: 4;
}`);

// geoCSSJSON output
/*
{
    "directive": {
        "@mode": "Flat"
    },
    "rules": [
        {
            "group": 1,
            "properties": {
                "fill": [
                    "hex",
                    "#aaff33"
                ],
                "stroke": [
                    "hex",
                    "#333333"
                ],
                "stroke-width": 4
            },
            "selector": "*"
        }
    ]
}
*/

```

- From json structure to geocss encoding example

```js
import flatGeoCSS from 'flat-geo-css';

const style = flatGeoCSS.write({
    "directive": {
        "@mode": "Flat"
    },
    "rules": [
        {
            "group": 1,
            "properties": {
                "fill": [
                    "hex",
                    "#aaff33"
                ],
                "stroke": [
                    "hex",
                    "#333333"
                ],
                "stroke-width": 4
            },
            "selector": "*"
        }
    ]
});

// style output
/*
@mode 'Flat';
* {
    fill: #aaff33;
    stroke: #333333;
    stroke-width: 4;
}
*/

```
