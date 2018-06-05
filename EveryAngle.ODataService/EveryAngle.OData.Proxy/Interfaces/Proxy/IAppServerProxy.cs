using EveryAngle.OData.DTO;
using RestSharp;
using System.Collections.Generic;

namespace EveryAngle.OData.Proxy
{
    public interface IAppServerProxy
    {
        int Model { get; }
        User SystemUser { get; }

        Angles GetAngles(int maxAngles, string anglesQuery, User user);
        Angles GetAngles(int offset, int limit, string anglesQuery, User user);
        Angle GetAngle(string uri, User user);
        Display GetDisplay(string uri, User user);
        bool LoginUser(User user);
        bool TryGetCurrentInstance(User user, out string currentInstance);
        string GetCurrentInstance(User user);
        Fields GetModelFields(string currentInstance, IEnumerable<string> fields, User user);
        QueryResult GetResult(User user, string uri);
        QueryResult ExecuteAngleDisplay(User user, Display display);
        DataRows GetResultData(User user, QueryResult result, Display display, int? skip, int? top);
    }
}
