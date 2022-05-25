---
title: "Hardening The Moto One Macro"
date: 2021-11-30T06:56:35+03:00
tags: ["guide", "security", "android"]
---

The Motorola One Macro is a mid-range phone, with decent "openness" which allows
basic hardening modification. The phone has the follow specifications:

* Mediatek MT6771 Helio P70 CPU
* 720 x 1520 px, 19:9 ratios (~270 ppi)
* Comes with Anroid 9.0, officially upgradable to Android 10.0
* Mali-G72 MP3 GPU
* eMMC 5.1 storage with 64GB 
* microSDXC uses shared SIM slot, 32GB tested
* Main camera 13 MP, depth camera 2MP, 2MP for macro camera
* WIFI 802.11 b/g/n, with hotspot
* No NFC support

This guide goes over unlocking the bootloader, flashing a GSI, flashing
LineageOS, reflashing stock ROM, fixing bootloop problems, and news
on TWRP for the Moto One Macro.

<!--more-->

# Moto's Naming Schemes
Motorola has a weird naming scheme, but the following is a fair summary. XT2016
is the model name. XT2016-1 and XT2016-2 are two different models. To check for
your own variant, go to *Settings -> About phone -> Model & hardware*. PMD named
ROMs are older than QMD named ROMs. QMD30, 30 is the release version. Lima is
the nickname for Moto One Macro. Software channel, from my understanding, is
related to the source of system updates. I had trouble updating after flashing
Android 10 directly, but flashing stock Android 9.0 solved the issue. I haven't
tested it thoroughly though. Updating from stock Android 9.0 to Android 10 is 
easily done from the settings.

# Unlocking the Bootloader
Go to [Motorola's official website](https://motorola-global-portal.custhelp.com/app/standalone/bootloader/unlock-your-device-a/),
click next, create an account, plug your phone into your computer and run:

```bash
fastboot oem get_unlock_data
```

This command will return five lines of data, concatenate the data returned
after ```(bootloader) ```. Paste this string into the textbox on the site. You
will be e-mailed with your unlocking code.

Finally, to unlock the phone:

```bash
fastboot oem unlock [e-mailed code]
# run the previous command twice
```

*Note: This formats ALL user-data and voids any warranty*

# Flashing Stock
Stock ROMs can be useful to reset and try any new updates Motorola bestows upon
its users, or to use Google-based Apps. Usually, these ROMs are infested with
*Motorola & Metaverse* software.

To get the stock ROM, navigate to [motostockrom.com](https://motostockrom.com), search
for XT2016, select the correct model varient and choose your stock ROM to
download.

Unzip the file, ```chmod``` the ```flashfile.bat```, after examining the file.
Plug your phone, and run the following commands:

```bash
unzip $(moto_stock_rom_file).zip
cd $(moto_stock_rom_file)/Firmware/
vi flashfile.bat # examine the file, make sure it isn't doing something fishy
chmod +x flashfile.bat
./flashfile.bat
```

*Note: This formats ALL user-data and voids any warranty*

# Flashing GSI
GSIs are generic images, where the Android system is updated seperate from
proprietary vendor drivers. GSI can be AOSP, Google plagued, or LineageOS. This 
section talks about the [treble
GSIs](https://github.com/phhusson/treble_experimentations). The only treble GSI ROM
I have tested is [AOSP 10.0 v220](https://github.com/phhusson/treble_experimentations/releases/tag/v220).
Always choose arm64 A/B ROMs.

Download Google's [vbmeta](https://dl.google.com/developers/android/qt/images/gsi/vbmeta.img).
After downloading the variant you want to flash, run the following commands:

```bash
unxz $(system_iso).xz
fastboot --disable-verity --disable-verification flash vbmeta_a vbmeta.img
fastboot --disable-verity --disable-verification flash vbmeta_b vbmeta.img
fastboot flash system_a $(system_iso)
fastboot flash system_b $(system_iso)
fastboot erase userdata
```

*Note: This formats ALL user-data and voids any warranty*

# Flashing LineageOS
LineageOS being a customizable custom android ROM, is wanted by many.
Unfortunately, one can only support as many Android devices until it is no 
longer feasable. GSIs try to deliver a user experience that attempts to solve 
this. LineageOS GSI ROMs tend to be very buggy, mainly because of issues with
vendor bootloaders. LineageOS GSI is flashable to the One Macro, and does indeed
work. Wi-Fi, SMS and Calls do work. I have not tested Bluetooth. The image we
are going to flash is not official nor affiliated with LineageOS developers
themselves.

Download Google's [vbmeta](https://dl.google.com/developers/android/qt/images/gsi/vbmeta.img).
Navigate to [Andy Yan's files](https://sourceforge.net/projects/andyyan-gsi/files/). I have tested
LineageOS 17. Pick the image with arm64 *and* A/B systems. Then run the
following commands:

```bash
unxz $(system_iso).xz
fastboot --disable-verity --disable-verification flash vbmeta_a vbmeta.img
fastboot --disable-verity --disable-verification flash vbmeta_b vbmeta.img
fastboot flash system_a $(system_iso)
fastboot flash system_b $(system_iso)
fastboot erase userdata
```

*Note: This formats ALL user-data and voids any warranty*

# Magisk
Generally, following [Magisk's official](https://topjohnwu.github.io/Magisk/install.html) installation
guide works out of the box. Note however after flashing phh's treble 
GSIs, first Securize ROM by unrooting the device. *Settings -> Phh Settings -> Securize*

# Common Problems
I have intentionally left out problems to this section due to its 
repetitiveness. This section includes solutions that are hacky but worked for
me. Suprisingly, this phone *never* permanently soft-bricked.

## Corrupted dm-verity
After flashing multiple times with different ROMs, you might recieve a
dm-verity & memory is corrupt error or something similar. You might have also 
tried formatting ```user-data``` and flashing ```vbmeta``` as done before. This issue
happened to me after I tried to downgrade to Android 10 stock ROM. Resolving
this issue is as easy as relocking and unlocking the bootloader.

```bash
fastboot oem lock
# run the previous command twice
```

*Note: This formats ALL user-data and voids any warranty*

## Motorola Updates not Working
Contrary to what Motorola said, updates can *still* be delivered OTA even after
unlocking the bootloader. I was able to upgrade from stock Android 9.0 to
Android 10. Although I haven't tested twice, downloading stock PMD29.70-81
should work with OTA updates.

## Failed to Flash Bootloader
This section is not completely fledged out, but there are multiple methods that
could be tried when you occur an error when flashing stock bootloader. Firstly,
try with verity off, download Google's
[vbmeta](https://dl.google.com/developers/android/qt/images/gsi/vbmeta.img):

```bash
fastboot --disable-verity --disable-verification flash vbmeta_a vbmeta.img
fastboot --disable-verity --disable-verification flash vbmeta_b vbmeta.img
fastboot erase userdata
```

*Note: This formats ALL user-data and voids any warranty*

Secondly, you can try flashing Magisk's patched bootloader. If you would like
an un-rooted system, do not install Magisk's Manager.

Thirdly, as a last resort, try relocking and unlocking the bootloader.
Process mentioned in "[Corrupted dm-verity]({{< ref "#Curropted%20dm-verity" >}})" section.

# TWRP
[TWRP](https://twrp.me) is an amazing bootloader. Control and customizability is
a hallmark pillar of TWRP. I personally tried working on building a TWRP
recovery for the One Macro. I got a basic working demo. Unfortunately, could 
not get any drivers to work properly. This issue could be blamed on Motorola. 
Their drivers aren't open-source. There might be a solution of getting blobs,
although I found non.

The current Git repositories that are trying to develop a recovery:

* [realaltffour/anroid_device_motorola_lima_twrp](https://github.com/realaltffour/android_device_motorola_lima_twrp)
(my build)
* [mototek/recovery_motorola_lima](https://github.com/mototek/recovery_motorola_lima)

If you know any more, feel free to send me an email! <me@ayham.xyz>

# Conclusion
This article was titled "Hardening the One Macro" for a reason. A first step
towards hardening your mobile phone is unlocking the bootloader. And although
this guide shows how to flash stock ROMs, these are only for pragmatic reasons.
I encourage you to flash your Moto One Macro with a treble FOSS build.
