using System;
using System.Configuration;
using System.Linq;
using System.Web;
using StackExchange.Profiling;

namespace EveryAngle.ManagementConsole.Helpers
{
    /// <summary>
    ///     The profiler.
    /// </summary>
    public class Profiler
    {
        /// <summary>
        ///     The key to obtain current user's login ID.
        /// </summary>
        public const string SESSION_KEY_CURRENT_USER = "CurrentUser.LoginID";


        /// <summary>
        ///     The initialize.
        /// </summary>
        public static void Initialize()
        {
            MiniProfiler.Settings.Storage = new Log4NetStorage();

            if (MiniProfiler.Settings.IgnoredPaths == null)
                return;

            // add partials of the URLs that you don't want to profile
            var ignored = MiniProfiler.Settings.IgnoredPaths.ToList();
            ignored.Add("images");
            ignored.Add("style");
            ignored.Add("include");
            ignored.Add("jsdebug");
            ignored.Add(".axd");
            ignored.Add(".js");
            ignored.Add(".png");
            ignored.Add(".svg");
            ignored.Add(".ashx");
            MiniProfiler.Settings.IgnoredPaths = ignored.ToArray();
        }

        /// <summary>
        ///     Start profiling the current request.
        /// </summary>
        /// <param name="context">
        ///     The request context.
        /// </param>
        /// <remarks>
        ///     The current user may not belong to the profiler target which is set in the web.config file.
        ///     In that case, don't start Miniprofiler.
        /// </remarks>
        public static void Start(HttpContext context)
        {
            if (context == null || context.Session == null)
                return;

            string user = context.Session[SESSION_KEY_CURRENT_USER] as string;
            if (string.IsNullOrEmpty(user))
                return;

            if (!ProfilerSetting.CheckUser(user))
                return;
            MiniProfiler.Start();

            if (MiniProfiler.Current == null)
                return;
            MiniProfiler.Current.User = user;
        }

        /// <summary>
        ///     stop profiling the current request.
        /// </summary>
        /// <remarks>
        ///     MiniProfiler internally decide when to write messages to Log4Net.
        ///     Log4Net is configured in the web.config to write messages that it receives from MiniProfiler to the disk at its own
        ///     timing.
        /// </remarks>
        public static void Stop()
        {
            MiniProfiler.Stop();
            if (MiniProfiler.Settings.Storage != null && MiniProfiler.Current != null)
                MiniProfiler.Settings.Storage.Save(MiniProfiler.Current);
        }

        /// <summary>
        ///     The profiler setting.
        /// </summary>
        public static class ProfilerSetting
        {
            /// <summary>
            ///     The AppSetting key for list of user login IDs to run profile.
            /// </summary>
            private const string CONFIG_KEY_PROFILER_TARGET_LOGIN_LIST = "ProfilerTargetLoginCommaSeparatedList";

            /// <summary>
            ///     Initializes static members of the <see cref="ProfilerSetting" /> class.
            /// </summary>
            /// <remarks>
            ///     Load the ProfilerTargetLoginCommaSeparatedList setting from web.config.
            /// </remarks>
            static ProfilerSetting()
            {
                string appSettingValue;
                try
                {
                    appSettingValue = ConfigurationManager.AppSettings[CONFIG_KEY_PROFILER_TARGET_LOGIN_LIST];
                }
                catch (Exception anyError)
                {
                    throw new ConfigurationErrorsException(string.Format("Cannot read AppSettings for key<{0}>",
                        CONFIG_KEY_PROFILER_TARGET_LOGIN_LIST), anyError);
                }

                if (appSettingValue != null)
                    ProfilerTargetLoginCommaSeparatedList = appSettingValue.Split(',');
            }

            /// <summary>
            ///     Gets or sets the profiler target login comma separated list.
            /// </summary>
            public static string[] ProfilerTargetLoginCommaSeparatedList { get; set; }

            /// <summary>
            ///     Check the user against the ProfilerTargetLoginCommaSeparatedList setting in web.config.
            /// </summary>
            /// <param name="user">
            ///     The user.
            /// </param>
            /// <returns>
            ///     True if the list contains the user; Otherwise, false.
            /// </returns>
            public static bool CheckUser(string user)
            {
                if (user == null || ProfilerTargetLoginCommaSeparatedList == null)
                    return false;
                return
                    ProfilerTargetLoginCommaSeparatedList.Any(
                        loginIdToCheck =>
                            string.Compare(loginIdToCheck, user, StringComparison.CurrentCultureIgnoreCase) == 0);
            }
        }
    }
}
