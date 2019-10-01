using EveryAngle.OData.DTO.Model;
using System;
using System.Collections.Concurrent;
using System.Linq;
using System.Text;

namespace EveryAngle.OData.Proxy
{
    public class User
    {
        private const char _basicAuthenticationCredentialSeparator = ':';

        #region Constructors

        public static User None { get; private set; } = new User();

        public User()
        {
            Username = "none";
            Password = null;
        }

        public User(string username, string password)
        {
            Username = username;
            Password = password;
        }

        public User(string base64EncodedCredentials)
        {
            Encoding encoding = Encoding.GetEncoding("utf-8");
            string decodedString = encoding.GetString(Convert.FromBase64String(base64EncodedCredentials));

            // Split credentials in 2 parts on 1st separator
            string[] credentialParts = decodedString.Split(new char[] { _basicAuthenticationCredentialSeparator }, 2);

            Username = credentialParts.First();
            Password = credentialParts.Last();

            // try to find a cached token
            User cachedUser = TokenCache.FindToken(Key);
            if (cachedUser != null)
            {
                SecurityToken = cachedUser.SecurityToken;
                ModelPrivileges = cachedUser.ModelPrivileges;
            }
        }

        #endregion

        #region Public properties

        public string Username { get; private set; }
        public string Password { get; private set; }
        public string SecurityToken { get; private set; }
        public bool HasSecurityToken { get { return !string.IsNullOrEmpty(SecurityToken); } }

        public ModelPrivilegeListViewModel ModelPrivileges { get; set; }

        #endregion

        #region Public methods

        public void RegisterSecurityToken(string securityToken)
        {
            SecurityToken = securityToken;
        }

        public void RemoveSecurityToken(string securityToken)
        {
            if (HasSecurityToken)
                TokenCache.RemoveToken(Key);
        }

        public void SaveToCache()
        {
            if (HasSecurityToken)
                TokenCache.SaveToken(Key, this);
            else
                TokenCache.RemoveToken(Key);
        }

        #endregion

        #region private properties

        private string Key { get { return string.Format("{0}{1}{2}", Username, _basicAuthenticationCredentialSeparator, Password); } }

        #endregion

        #region Private Token cache
        private static class TokenCache
        {
            internal readonly static ConcurrentDictionary<string, User> _cachedUserTokens = new ConcurrentDictionary<string, User>();
            internal static void SaveToken(string key, User token)
            {
                _cachedUserTokens.AddOrUpdate(key, token, (k, v) => token);
            }

            internal static User FindToken(string key)
            {
                return _cachedUserTokens.TryGetValue(key, out User storedUser)
                    ? storedUser
                    : null;
            }

            internal static void RemoveToken(string key)
            {
                _cachedUserTokens.TryRemove(key, out User oldUser);
            }
        }
        #endregion
    }

}
