---
title: "True Full Disk Encryption On Linux"
date: 2021-12-10T07:09:31+03:00
tags: ["guide", "linux", "security"]
---

My friends laugh at me when they are told that I have to put in 4 passwords 
with ~18 characters each to login into my computer. I laugh back at them,
wishing them joy with Ads in the start-menu.

In this article, we will discuss *true* full disk encryption. Everything,
including having the kernel encrypted using LUKS. I personally found difficulty
in finding good documentation detailing how to set-up disk encryption.
Hopefully this guide would help someone out there.

<!--more-->

# Introduction
We will be installing [Artix Linux](https://artixlinux.org/), because this is
what I use and recommend (not for everyone). This tutorial should work using
any distro that allows you to select where to install the system. In the end we
would have a bootable UEFI system where the user is prompted for a password to
unlock the ```/boot/``` partition, then another prompt for the main partition.
The reason for this seperation is that GRUB, at least with my testing 
(2021-08), does not officially (?) support LUKS2 formatting.

```
$ lsblk
NAME             MAJ:MIN RM   SIZE RO TYPE  MOUNTPOINTS
sda                8:0    0 931.5G  0 disk  
├─sda1             8:1    0   512M  0 part  
├─sda2             8:2    0     2G  0 part  
└─sda3             8:3    0   929G  0 part  
  └─hdd          254:0    0   929G  0 crypt 
    ├─vol-root   254:1    0   150G  0 lvm   /
    ├─vol-home   254:2    0   300G  0 lvm   /home
    ├─vol-data   254:3    0   421G  0 lvm   /data
    ├─vol-swap   254:4    0     8G  0 lvm   [SWAP]

```

This would be the final result. LVM over LUKS2 for the main (```/dev/sda3```)
partition, LUKS1 for ```/dev/sda2```, and the UEFI disk on ```/dev/sda1```.

I am not responsible for any loss of data that occurs because you irresponsibly
ran any command.

Flash your ISO into your USB, turn off your device, plug the USB in, boot into
the USB, and follow this guide from another device.

# Partitioning the Disk
Following this would irreversibly erase your whole disk. First, start by
identifying the disk name. Run ```lsblk```, find your disk name by its known
space. I from hereafter use ```/dev/sda``` as the installation hard-disk.
Using your [favourite disk editing tools](https://wiki.archlinux.org/title/Partitioning#Tools),
do the following tasks:

* Label disk as GPT
* Create a 512MB, EFI tagged. FAT32 formatted. (```/dev/sda1```)
* Create the boot disk with 2GB. We will format it later on. (```/dev/sda2```)
* Create the main disk with as much space that is available, leave some at the
  end. We will format it later on. (```/dev/sda3```)

Set up the boot disk, then the main disk:

```
$ cryptsetup luksFormat --type luks1 /dev/sda2
$ cryptsetup luksFormat --type luks2 /dev/sda3
```

Format the boot disk:

```
$ cryptsetup open /dev/sda2 boot-crypt
$ mkfs.ext4 /dev/mapper/boot-crypt
```

Format the main disk as LVM:

```
$ cryptsetup open /dev/sda3 hdd
$ pvcreate /dev/mapper/hdd
$ vgcreate vol /dev/mapper/hdd
$ lvcreate -L[your / size] -n root vol
$ lvcreate -L[your /home size] -n home vol
$ lvcreate -L[your /data size] -n data vol
$ mkfs.ext4 /dev/vol/root
$ mkfs.ext4 /dev/vol/home
$ mkfs.ext4 /dev/vol/data
```

Your disk should be ready for installation!

# Artix Installation
This section won't hold your hand installing a full Artix system. I will just
go over configuring the disk. ```mount``` your horses and go ```chroot```ing!

```
$ mount /dev/vol/root /mnt/
$ mkdir -p /mnt/home/
$ mount /dev/vol/home /mnt/home/
$ mkdir -p /mnt/boot/EFI
$ mount /dev/sda1 /mnt/boot/EFI
$ mount /dev/mapper/boot-crypt /mnt/boot/
$ mkdir -p /mnt/data
$ mount /dev/vol/data /mnt/data
$ lsblk # check if everything is fine
$ # After bootstrapping Artix Linux into /mnt, don't forget to configure fstab!
$ artix-chroot /mnt/
$ # Continue installing the system, skipping GRUB for the next section
```

## GRUB Bootloader Installation & Configuration
This section assumes that you are already ```chroot```ed. Install ```GRUB```:

```
$ pacman -S grub efibootmgr
```

Set-up ```GRUB``` & ```mkinitcpio``` for encryption:

```
$ vi /etc/default/grub
# Change the following:
GRUB_CMDLINE_LINUX="... cryptdevice=UUID=[YOUR LUKS PARTITION UUID]"
GRUB_PRELOAD_MODULES="part_gpt part_msdos lvm"
GRUB_ENABLE_CRYPTODISK=y
$ grub-install --target=x86_64-efi --efi-directory=/boot/efi --bootloader-id=grub
```

```
$ vi /etc/mkinitcpio.conf
# Change the following:
HOOKS=(.. lvm2 encrypt)
```

Finally, configure ```GRUB```:

```
$ grub-mkconfig -o /boot/grub/grub.cfg
```

Make sure you run ```mkinitcpio```, do so by updating your kernel pacman will
update your initcpio automatically, or run this:

```
$ mkinitcpio -P
```

Congratz, you should have a *true* full disk encryption system!

# Conclusion
Full disk encryption should not be hard to setup, try it out in a VM before
converting all of your machines!

