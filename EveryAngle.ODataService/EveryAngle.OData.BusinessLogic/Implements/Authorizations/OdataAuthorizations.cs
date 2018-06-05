using EveryAngle.OData.BusinessLogic.Interfaces.Authorizations;
using EveryAngle.OData.DTO.Model;
using EveryAngle.OData.Proxy;
using EveryAngle.OData.Settings;
using System;
using System.Linq;

namespace EveryAngle.OData.BusinessLogic.Implements.Authorizations
{
    public class OdataAuthorizations : IOdataAuthorizations
    {
        public bool MayView(User user)
        {
            bool hasPrivileges = false;
            if (user.ModelPrivileges != null && user.ModelPrivileges.model_privileges != null)
            {
                hasPrivileges = user.ModelPrivileges.model_privileges.Any(f => f.privileges.access_data_via_odata.Equals(true) && f.roles.Any(x => x.model_id.Equals(ODataSettings.Settings.ModelId, StringComparison.OrdinalIgnoreCase)));
                if (!hasPrivileges)
                {
                    user.RemoveSecurityToken(user.SecurityToken);
                }
            }
            return hasPrivileges;
        }
    }
}
