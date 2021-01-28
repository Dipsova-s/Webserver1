using EveryAngle.Core.ViewModels;
using EveryAngle.Core.ViewModels.Model;
using EveryAngle.Core.ViewModels.Users;
using System.Collections.Generic;

namespace EveryAngle.Core.Interfaces.Services
{
    public interface IUserService 
    {
        UserViewModel GetUser(string uri);
        ListViewModel<UserViewModel> GetUsers(string uri);

        UserSettingsViewModel GetUserSetting(string uri);
        SystemRoleViewModel GetRole(string roleUri);
        string UpdateUserRole(string userRoleUri, string jsonData);
        string UpdateUser(string userUri, string jsonData);
        List<SystemRoleViewModel> GetSystemRoles(string systemRoleUri);
        void DeleteSession(string userUri);
        void DeleteUser(string uri);
        List<AuthenticatedUserViewModel> GetUserAuthenticated(string uri);
        ConsolidatedRoleViewModel GetConsolidatedRole(string consolidatedRoleUri);
        ListViewModel<AuthenticationProviderUserViewModel> GetUnableUsers(string uri);
        IEnumerable<SystemAuthenticationProviderViewModel> GetSystemAuthenticationProviders(string uri);
        AuthenticationProviderUserViewModel GetUserAuthentication(string uri);

        List<AuthenticationProviderUserViewModel> GetAuthenticationProviderUser(string uri);

        void UpdateAuthentication(string authenticationProviderUri, string authenticationProviderData);

        void UpdateUserSetting(string uri, string userSettingData);

        List<ViewModels.Privilege.ModelPrivilegeViewModel> GetUserModelPrivilege(string modelPrivilegesUri);

        ModelAuthorizationsViewModel GetModelAuthorizations(string uri);

        void UpdateDebugLogging(string sessionUri, bool isDebugLogging);
    }
}
