using EveryAngle.Core.ViewModels.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EveryAngle.Core.Interfaces.Services
{
    public interface IFacetService
    {
        IEnumerable<FacetViewModel> Get(string facetQuery);
    }
}
