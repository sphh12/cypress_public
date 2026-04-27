import platform
import os
import time
import subprocess

system = platform.system()
is_docker = os.path.exists('/.dockerenv')

print("Alert 클릭 스크립트 시작...")
print(f"환경 감지: OS={system}, Docker={is_docker}")

# Alert이 나타날 때까지 충분히 대기 (5초)
time.sleep(5)

print("Enter 키 입력 시도...")

if system == "Windows" and not is_docker:
    # Windows 환경: pyautogui 사용
    try:
        import pyautogui
        pyautogui.press('enter')
        print("pyautogui - Enter 키 입력 완료")
    except ImportError:
        print("오류: pyautogui가 설치되어 있지 않습니다. pip install pyautogui")
elif system == "Linux" or is_docker:
    # Linux/Docker 환경: xdotool 사용
    try:
        result = subprocess.run(['xdotool', 'key', 'Return'], capture_output=True, text=True)
        if result.returncode == 0:
            print("xdotool - Enter 키 입력 완료")
        else:
            print(f"xdotool 오류: {result.stderr}")
    except FileNotFoundError:
        print("오류: xdotool이 설치되어 있지 않습니다. apt-get install -y xdotool")
else:
    print(f"지원하지 않는 환경: {system}")

time.sleep(0.5)
print("Alert 클릭 완료!")
