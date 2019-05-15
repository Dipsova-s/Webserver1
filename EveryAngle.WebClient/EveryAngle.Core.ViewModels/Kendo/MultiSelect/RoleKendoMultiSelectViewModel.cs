using EveryAngle.Core.ViewModels.Users;
using System;
using System.Collections.Generic;
using System.Linq;

namespace EveryAngle.Core.ViewModels.Kendo
{
    public class RoleKendoMultiSelectViewModel : KendoMultiSelectViewModel
    {
        private readonly string _roleId;
        private readonly string _modelId;
        public RoleKendoMultiSelectViewModel(string roleId, string modelId)
        {
            Id = Guid.NewGuid();
            Text = roleId;
            _roleId = roleId;
            _modelId = modelId;
        }
        public override string Value
        {
            get
            {
                return string.IsNullOrEmpty(_modelId) ? _roleId : string.Format("{0}:{1}", _modelId, _roleId);
            }
        }
        public override string Tooltip
        {
            get
            {
                if (IsDefaultRole)
                    return "Default role";

                return string.IsNullOrEmpty(_modelId) ? "System role" : _modelId + " model role";
            }
        }
        public bool IsDefaultRole { get; set; }

        public static IList<RoleKendoMultiSelectViewModel> GetDefaultRolesMultiSelectViewModels(IList<RoleKendoMultiSelectViewModel> allRoles, IList<AssignedRoleViewModel> defaultRoles)
        {
            var defaultRoleValues = defaultRoles.Select(x => new RoleKendoMultiSelectViewModel(x.RoleId, x.ModelId).Value);
            return allRoles.Where(x => defaultRoleValues.Contains(x.Value))
                                                    .Select(x =>
                                                    {
                                                        x.IsDefaultRole = true;
                                                        return x;
                                                    })
                                                    .ToList();
        }
    }
}
