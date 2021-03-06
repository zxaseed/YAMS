﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.IO;
using ICSharpCode.SharpZipLib.Zip;
using ICSharpCode.SharpZipLib.Zip.Compression.Streams;
using YAMS;

namespace YAMS
{
    public static class Backup
    {

        public static void BackupNow(MCServer s, string strAppendName = "")
        {
            Database.AddLog("Backing up " + s.ServerTitle, "backup");

            //Check for a backup dir and create if not
            if (!Directory.Exists(s.ServerDirectory + @"\backups\")) Directory.CreateDirectory(s.ServerDirectory + @"\backups\");

            //Force a save
            s.Save();
            s.DisableSaving();

            //Find all the directories that start with "world"
            if (Directory.Exists(Core.StoragePath + s.ServerID.ToString() + @"\backups\temp\")) Directory.Delete(Core.StoragePath + s.ServerID.ToString() + @"\backups\temp\", true);
            if (!Directory.Exists(Core.StoragePath + s.ServerID.ToString() + @"\backups\temp\")) Directory.CreateDirectory(Core.StoragePath + s.ServerID.ToString() + @"\backups\temp\");

            string[] dirs = Directory.GetDirectories(s.ServerDirectory, "world*");
            foreach (string dir in dirs)
            {
                //Copy world to a temp Dir
                DirectoryInfo thisDir = new DirectoryInfo(dir);
                Util.Copy(dir, s.ServerDirectory + @"\backups\temp\" + thisDir.Name);
            }

            //Re-enable saving then force another save
            s.EnableSaving();
            s.Save();

            //Now zip up temp dir and move to backups
            FastZip z = new FastZip();
            z.CreateEmptyDirectories = true;
            z.CreateZip(s.ServerDirectory + @"\backups\" + DateTime.Now.Year + "-" + DateTime.Now.Month.ToString("D2") + "-" + DateTime.Now.Day.ToString("D2") + "-" + DateTime.Now.Hour.ToString("D2") + "-" + DateTime.Now.Minute.ToString("D2") + strAppendName + ".zip", s.ServerDirectory + @"\backups\temp\", true, "");

            //If the server is empty, reset the HasChanged
            if (s.Players.Count == 0) s.HasChanged = false;
        }

        public static void BackupIfNeeded(MCServer s)
        {
            //Only backup if the world has changed since last one
            if (s.HasChanged)
            {
                BackupNow(s);
            }
        }

        public static void ClearBackups(MCServer s, string strPeriod, int intAmount)
        {

            Database.AddLog("Clearing backups older than " + intAmount.ToString() + " " + strPeriod, "backup", "info", false, s.ServerID);

            string[] files = Directory.GetFiles(s.ServerDirectory + @"\backups\");

            foreach (string file in files)
            {
                FileInfo fi = new FileInfo(file);
                DateTime endTime = new DateTime();
                switch (strPeriod)
                {
                    case "yy":
                        endTime = DateTime.Now.AddYears(-intAmount);
                        break;
                    case "mm":
                        endTime = DateTime.Now.AddMonths(-intAmount);
                        break;
                    case "dd":
                        endTime = DateTime.Now.AddDays(-intAmount);
                        break;
                }
                if (fi.CreationTime < endTime)
                    fi.Delete();
            }
        }

    }
}
