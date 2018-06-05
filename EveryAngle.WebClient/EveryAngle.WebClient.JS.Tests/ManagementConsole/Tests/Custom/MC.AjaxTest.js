describe('MC.ajax.js tests', function () {

    describe('response status tests', function () {
        var statusList = [401, 440];
        statusList.forEach(function(status) {
            it('should response ' + status, function () {
                spyOn(MC.ajax, 'getErrorMessage').and.returnValue('');
                spyOn(MC.ui.loading, 'setError');
                spyOn(MC.util, 'reload');

                MC.ajax.onAjaxError(null, {
                    status: status
                });

                expect(MC.util.reload).toHaveBeenCalled();
            });
        });
    });

});
