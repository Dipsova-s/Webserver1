using System.Collections.Generic;

namespace EveryAngle.OData.DTO.Model
{
    public class ModelPrivilegeViewModel
    {
        public List<AssignedRolesViewModel> roles { get; set; }

        public PrivilegesForModelViewModel privileges { get; set; }
    }
}
