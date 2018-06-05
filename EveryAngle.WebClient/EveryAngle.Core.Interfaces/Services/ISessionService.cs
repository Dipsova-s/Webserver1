using EveryAngle.Core.ViewModels;
using EveryAngle.Core.ViewModels.Directory;
using EveryAngle.Core.ViewModels.Users;


namespace EveryAngle.Core.Interfaces.Services
{
    public interface ISessionService
    {
        ListViewModel<SessionViewModel> GetSessions(string uri);
        SessionViewModel GetSession(string uri);
        VersionViewModel GetSessionByIwa(string uri);
        void UpdateSession(string sessionUri, string isActive);
    }
}
