---
title: "A Minimal Linux Display Manager"
date: 2021-12-28T07:03:14+03:00
tags: ["linux", "guide"]
---

There is this itch that tiling window manager users feel. Whether it is caused
by surfing the world of r/unix or the want for change, it might be useful to
have a way to easily switch between window managers. This article shows how to
achieve this using already installed applications on your system.

<!--more-->

# A BASH on the head.
On most *sane* Linux distributions, BASH is provided as a default shell script
interpreter, I will be using that. When I said minimal, I meant *minimal*. With
barely 38 lines, I know no other contestant. For a bonus, I will also use 
```sx``` & ```ssh-agent```.

```bash
#!/bin/bash

DwmOption="DWM"
EXWMOption="EXWM"
MATEOption="MATE"
EnlightenmentOption="Enlightenment"
ConsoleOption="Console"
menu=("$DwmOption" "$EXWMOption" "$MATEOption" "$EnlightenmentOption" "$ConsoleOption")

echo "Which WM would you like to run?"
select opt in "${menu[@]}"
do
	case $opt in 
		$DwmOption)
			exec ssh-agent sx sh ~/.config/X11/dwm-xinit 
			break
			;;
		$EXWMOption)
			exec ssh-agent sx sh ~/.config/X11/exwm
			break
			;;
		$MATEOption)
			exec ssh-agent sx mate-session
			break
			;;
		$EnlightenmentOption)
			exec ssh-agent sx sh ~/.config/X11/enlightenment
			break
			;;
		$ConsoleOption)
			exec zsh
			break
			;;
		*) echo "invalid option $REPLY"
	esac
done
```

That's it! For adding extra entries:

- create a new 'Option' variable, 
- then add it to the ```menu``` array,
- adding the extra option to the 'cases' clause appropriately.

Enjoy!
