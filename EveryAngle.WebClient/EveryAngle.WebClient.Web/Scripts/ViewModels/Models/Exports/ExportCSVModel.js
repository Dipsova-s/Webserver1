/* M4-11519: Implemented export to csv */
function ExportCSVModel(option) {
    "use strict";

    var self = this;
    //BOF: Properties
    ExportModel.call(self, option);
    self.HeaderFormats = [
        { TEXT: enumHandlers.CSVHEADERENUM.NO.TEXT, VALUE: enumHandlers.CSVHEADERENUM.NO.VALUE },
        { TEXT: enumHandlers.CSVHEADERENUM.ID.TEXT, VALUE: enumHandlers.CSVHEADERENUM.ID.VALUE },
        { TEXT: enumHandlers.CSVHEADERENUM.SHORTNAME.TEXT, VALUE: enumHandlers.CSVHEADERENUM.SHORTNAME.VALUE },
        { TEXT: enumHandlers.CSVHEADERENUM.LONGNAME.TEXT, VALUE: enumHandlers.CSVHEADERENUM.LONGNAME.VALUE }
    ];
    self.EnquoteSettings = [
        { TEXT: enumHandlers.CSVENQUOTEENUM.NONE.TEXT, VALUE: enumHandlers.CSVENQUOTEENUM.NONE.VALUE },
        { TEXT: enumHandlers.CSVENQUOTEENUM.ONLYSTRINGS.TEXT, VALUE: enumHandlers.CSVENQUOTEENUM.ONLYSTRINGS.VALUE },
        { TEXT: enumHandlers.CSVENQUOTEENUM.ALL.TEXT, VALUE: enumHandlers.CSVENQUOTEENUM.ALL.VALUE }
    ];
    self.LineSeparators = [
        { TEXT: enumHandlers.LINESEPARATORENUM.CRLF, VALUE: enumHandlers.LINESEPARATORENUM.CRLF },
        { TEXT: enumHandlers.LINESEPARATORENUM.CR, VALUE: enumHandlers.LINESEPARATORENUM.CR },
        { TEXT: enumHandlers.LINESEPARATORENUM.LF, VALUE: enumHandlers.LINESEPARATORENUM.LF }
    ];
    self.MaximizeDecimals = 30; /* M4-13474: Added maximize decimal property into export csv model, Set 30 to maximize decimal value */
    self.EnumFormats = [
        { TEXT: enumHandlers.CSVENUMFORMAT.ID.TEXT, VALUE: enumHandlers.CSVENUMFORMAT.ID.VALUE },
        { TEXT: enumHandlers.CSVENUMFORMAT.DISPLAY.TEXT, VALUE: enumHandlers.CSVENUMFORMAT.DISPLAY.VALUE }
    ];
    self.DateFormats = [
       { TEXT: enumHandlers.CSVDATEFORMAT.yyyyMMdd.TEXT, VALUE: enumHandlers.CSVDATEFORMAT.yyyyMMdd.VALUE },
       { TEXT: enumHandlers.CSVDATEFORMAT.ddMMyyyy.TEXT, VALUE: enumHandlers.CSVDATEFORMAT.ddMMyyyy.VALUE },
       { TEXT: enumHandlers.CSVDATEFORMAT.MMddyyyy.TEXT, VALUE: enumHandlers.CSVDATEFORMAT.MMddyyyy.VALUE },
       { TEXT: enumHandlers.CSVDATEFORMAT.Mdyyyy.TEXT, VALUE: enumHandlers.CSVDATEFORMAT.Mdyyyy.VALUE },
       { TEXT: enumHandlers.CSVDATEFORMAT.dMyyyy.TEXT, VALUE: enumHandlers.CSVDATEFORMAT.dMyyyy.VALUE },
       { TEXT: enumHandlers.CSVDATEFORMAT.yyyyMd.TEXT, VALUE: enumHandlers.CSVDATEFORMAT.yyyyMd.VALUE }
    ];
    self.TimeFormats = [
       { TEXT: enumHandlers.CSVETIMEFORMAT.HHmmss.TEXT, VALUE: enumHandlers.CSVETIMEFORMAT.HHmmss.VALUE },
       { TEXT: enumHandlers.CSVETIMEFORMAT.Hmmss.TEXT, VALUE: enumHandlers.CSVETIMEFORMAT.Hmmss.VALUE },
       { TEXT: enumHandlers.CSVETIMEFORMAT.Hmm.TEXT, VALUE: enumHandlers.CSVETIMEFORMAT.Hmm.VALUE },
       { TEXT: enumHandlers.CSVETIMEFORMAT.HHmm.TEXT, VALUE: enumHandlers.CSVETIMEFORMAT.HHmm.VALUE },
       { TEXT: enumHandlers.CSVETIMEFORMAT.hhmmss.TEXT, VALUE: enumHandlers.CSVETIMEFORMAT.hhmmss.VALUE },
       { TEXT: enumHandlers.CSVETIMEFORMAT.hmmss.TEXT, VALUE: enumHandlers.CSVETIMEFORMAT.hmmss.VALUE },
       { TEXT: enumHandlers.CSVETIMEFORMAT.hmm.TEXT, VALUE: enumHandlers.CSVETIMEFORMAT.hmm.VALUE },
       { TEXT: enumHandlers.CSVETIMEFORMAT.hhmm.TEXT, VALUE: enumHandlers.CSVETIMEFORMAT.hhmm.VALUE }
    ];

    /* M4-13475: Created and set model timestamp default value to null in export csv model */
    self.DefaultAddModelDateAtColumn = null;

    self.HeaderFormat = '';
    self.EnquoteCharacter = ko.observable();
    self.EnquoteHeader = ko.observable(true);
    self.EnquoteHeader.ForEditing = ko.computed({
        read: function () {
            return self.EnquoteHeader().toString();
        },
        write: function (newValue) {
            self.EnquoteHeader(newValue === 'true');
        },
        owner: self
    });
    self.EnquoteSetting = '';
    self.FieldSeparator = ko.observable('');
    self.LineSeparator = '';
    self.DecimalSeparator = ko.observable('');
    self.DateSeparator = ko.observable('');
    self.TimeSeparator = ko.observable('');
    self.DateFormat = ko.observable('');
    self.TimeFormat = ko.observable('');
    self.Decimal = '';
    self.TrueChar = ko.observable('');
    self.FalseChar = ko.observable();
    self.EnumFormat = '';

    /* M4-13475: Created property to kept time stamp colum index in export csv model */
    self.AddModelDateAtColumn = '';

    self.MaxRowsToExport = ko.observable(-1);
    //EOF: Properties

    return self;
};

ExportCSVModel.prototype = new ExportModel();
ExportCSVModel.prototype.constructor = ExportCSVModel;
/* M4-11519: Implemented export to csv */
