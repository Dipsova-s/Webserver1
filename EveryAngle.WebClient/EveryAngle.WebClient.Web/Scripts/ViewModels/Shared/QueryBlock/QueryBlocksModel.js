function QueryBlocksModel(queryblocks, parent) {
    "use strict";

    var self = this;
    self.QueryBlocks = [];
    self.Parent = parent;

    // template
    self.GetBaseClassesTemplate = function (classes) {
        return {
            base_classes: WC.Utility.ToArray(classes),
            queryblock_type: enumHandlers.QUERYBLOCKTYPE.BASE_CLASSES
        }
    };
    self.GetBaseAngleTemplate = function (angle) {
        return {
            base_angle: angle || '',
            queryblock_type: enumHandlers.QUERYBLOCKTYPE.BASE_ANGLE
        }
    };
    self.GetBaseDisplayTemplate = function (display) {
        return {
            base_display: display || '',
            queryblock_type: enumHandlers.QUERYBLOCKTYPE.BASE_DISPLAY
        }
    };
    self.GetQueryStepTemplate = function (steps) {
        return {
            query_steps: WC.Utility.ToArray(steps),
            queryblock_type: enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS
        };
    };

    self.GetQueryBlocks = function (filter, cleanKO) {
        var queryblocks;
        if (filter) {
            queryblocks = self.QueryBlocks.findObjects('queryblock_type', filter);
        }
        else {
            queryblocks = self.QueryBlocks;
        }
        return cleanKO === true ? ko.toJS(queryblocks) : queryblocks;
    };
    self.SetQueryBlocks = function (blocks) {
        // merge queryblock steps if more than 1
        var blockSteps = blocks.findObjects('queryblock_type', enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS).slice();
        if (blockSteps.length > 1) {
            blocks.removeObject('queryblock_type', enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS);
            jQuery.each(blockSteps, function (index, block) {
                if (index > 0) {
                    blockSteps[0].query_steps = blockSteps[0].query_steps.concat(block.query_steps);
                }
            });
            blocks.push(blockSteps[0]);
        }

        // update model
        self.QueryBlocks = blocks.slice();
        jQuery.each(self.QueryBlocks, function (index, block) {
            self.QueryBlocks[index] = new QueryBlockModel(block);
        });
    };
    self.GetQuerySteps = function (filter, cleanKO) {
        var blockSteps = self.GetQueryBlocks(enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS);
        if (blockSteps.length) {
            var steps;
            if (filter) {
                steps = blockSteps[0].query_steps.findObjects('step_type', filter);
            }
            else {
                steps = blockSteps[0].query_steps;
            }
            return cleanKO === true ? ko.toJS(steps) : steps;
        }
        else {
            return [];
        }
    };

    // constructure
    self.SetQueryBlocks(WC.Utility.ToArray(ko.toJS(queryblocks)));
}
