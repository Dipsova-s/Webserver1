using EveryAngle.Core.Interfaces.Services;
using EveryAngle.Core.ViewModels.About;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EveryAngle.WebClient.Service.ApplicationServices
{
    public class CopyrightService : ICopyrightService
    {
        public virtual LicenseCopyrightViewModel GetLicenses(string path)
        {
            string json = System.IO.File.ReadAllText(path);
            LicenseCopyrightViewModel model = JsonConvert.DeserializeObject<LicenseCopyrightViewModel>(json);
            return model;
        }
    }
}
