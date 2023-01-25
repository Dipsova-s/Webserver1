using EveryAngle.Core.ViewModels;
using EveryAngle.Core.ViewModels.Directory;
using EveryAngle.Core.ViewModels.Users;


namespace EveryAngle.Core.Interfaces.Services
{
    public interface IUserProfileService
    {
        ListViewModel<UserProfileViewModel> GetSessions(string uri);
        UserProfileViewModel GetSession(string uri);
        VersionViewModel GetSessionByIwa(string uri);
        void UpdateSession(string sessionUri, string isActive);
    }
}
