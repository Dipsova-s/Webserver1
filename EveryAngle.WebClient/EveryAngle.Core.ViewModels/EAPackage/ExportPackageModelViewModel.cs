using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EveryAngle.Core.ViewModels.EAPackage
{
    public class ExportPackageModelViewModel
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public bool HasManageModelPrivilege { get; set; }
    }
}
