using Kendo.Mvc.UI;
using System;

namespace EveryAngle.ManagementConsole.Models
{
    public class MSLogDataSourceResult : DataSourceResult
    {
        public int? Totalwarning { get; set; }
        public int? TotalError { get; set; }
    }
}
