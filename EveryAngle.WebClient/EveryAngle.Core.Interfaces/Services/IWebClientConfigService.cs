using EveryAngle.Core.ViewModels.WebClientSettings;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EveryAngle.Core.Interfaces.Services
{
    public interface IWebClientConfigService
    {    
        WebClientConfigViewModel ApplyOverrideToWebClientConfigViewModel(WebClientConfigViewModel webClientConfigViewModel);

        WebClientConfigViewModel GetWebClientWebConfig();

        bool SaveWebClientWebConfig(WebClientConfigViewModel webClientConfigViewMode);
    }
}
