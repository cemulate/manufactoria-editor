
let imageMap = {
    Conveyor: 'img/conveyor.svg',
    ConveyorElbow: 'img/conveyor-elbow.svg',
    ConveyorTee: 'img/conveyor-tee.svg',
    ConveyorTeeTwo: 'img/conveyor-tee-2.svg',
    ConveyorEx: 'img/conveyor-ex.svg',
    CrossConveyor: 'img/cross-conveyor.svg',
    BranchBR: 'img/branch-br.svg',
    BranchGY: 'img/branch-gy.svg',
    WriteB: 'img/write-blue.svg',
    WriteR: 'img/write-red.svg',
    WriteY: 'img/write-yellow.svg',
    WriteG: 'img/write-green.svg',
    WriterConnector: 'img/writer-connector.svg',
    Start: 'img/start.svg',
    End: 'img/end.svg',

    DeleteButton: 'img/delete-button.svg',
    MirrorButton: 'img/mirror-button.svg',
    SizeUpButton: 'img/size-up-button.svg',
    SizeDownButton: 'img/size-down-button.svg',
    StopButton:  'img/stop-button.svg'
},

    globalCanvas = null,

    allImagePromises =
        Object.keys(imageMap).map(function(key) {
            var url = imageMap[key];

            var p = getSVG(url);

            p.then(function(svg) {
                imageMap[key] = svg;
            });

            return p;
        }),

    preloadPromise = Promise.all(allImagePromises);

function preload(paper) {
    globalCanvas = paper.g().attr({visibility: 'hidden'});
    return preloadPromise;
};

function getGraphic(name) {
    var original = imageMap[name];

    if (original.parent() !== globalCanvas)
        globalCanvas.append(original);

    if (original) {
        return globalCanvas.use(original).attr({visibility: 'visible'});
    }

    return null;
};

function screenPointToLocal(x, y, element) {
    var svg = element.node.ownerSVGElement || element.node,
        spt = svg.createSVGPoint(),
        mat = element.node.getScreenCTM();

    spt.x = x;
    spt.y = y;

    return spt.matrixTransform(mat.inverse());
};

export {preload, getGraphic, screenPointToLocal};
export default {preload, getGraphic, screenPointToLocal};

function getSVG(url) {
    if (!getSVG.cache) {
        getSVG.cache = {};
    }

    if (getSVG.cache[url] == undefined) {
        // retrieve the graphic
        var p = new Promise(
            function(resolve, reject) {
                Snap.load(
                    url,
                    function(fragment) {
                        var g = fragment.select('g');
                        getSVG.cache[url] = Promise.resolve(g);

                        resolve(g.clone());
                    });
            }
        );

        getSVG.cache[url] = p;

        return p;
    } else {
        return Promise.resolve(getSVG.cache[url]).then(function(g) {
            return g.clone();
        });
    }
};
