using EveryAngle.Core.Interfaces.Services;
using EveryAngle.Core.ViewModels;
using System;
using System.Collections.Generic;

namespace EveryAngle.WebClient.Service.ApiServices
{
    public class ComponentService : BaseService, IComponentService
    {
        #region Constant

        private const string CSM_URI = "csm/componentservices";
        private const string CSM_DELETE_URI = "csm/componentservices/{0}";

        #endregion

        public IEnumerable<ComponentViewModel> GetItems()
        {
            IEnumerable<ComponentViewModel> componentViewModels = GetArrayItems<ComponentViewModel>(CSM_URI);
            return componentViewModels;
        }

        public void Delete(Guid registrationId)
        {
            string uri = string.Format(CSM_DELETE_URI, registrationId);
            Delete(uri);
        }
    }
}
