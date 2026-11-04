#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Servidor HTTP Local para Aulas de Robótica (Sem Internet)
Permite que todos os computadores, tablets ou celulares conectados
na mesma rede Wi-Fi/cabeada acessem os manuais e slides interativos.
"""

import os
import sys
import socket
import webbrowser
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

PORT = 8000

def get_best_local_ip():
    """Identifica o IP principal da máquina na rede local."""
    # 1. Consulta a tabela de rotas do SO
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(('1.1.1.1', 80))
        ip = s.getsockname()[0]
        s.close()
        if ip and not ip.startswith(('127.', '169.254.', '26.', '100.')):
            return ip
    except Exception:
        pass

    # 2. Varredura de interfaces de rede
    try:
        hostname = socket.gethostname()
        ips = socket.gethostbyname_ex(hostname)[2]
        # Prioriza faixas padrão de rede local (Wi-Fi / Ethernet escolar)
        for ip in ips:
            if ip.startswith(('192.168.', '10.', '172.16.', '172.17.', '172.18.', '172.19.', '172.20.')):
                return ip
        for ip in ips:
            if not ip.startswith(('127.', '169.254.', '26.', '100.', '172.31.')):
                return ip
    except Exception:
        pass

    return '127.0.0.1'

def get_all_candidate_ips():
    """Retorna todos os IPs disponíveis na máquina."""
    results = []
    try:
        hostname = socket.gethostname()
        for ip in socket.gethostbyname_ex(hostname)[2]:
            if not ip.startswith('127.'):
                results.append(ip)
    except Exception:
        pass
    return results

class CustomHTTPHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        # Garante que o diretório servido é o diretório raiz deste script
        super().__init__(*args, directory=os.path.dirname(os.path.abspath(__file__)), **kwargs)

    def end_headers(self):
        # Permite conexões CORS e desativa bloqueios de iframe/rede local
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-cache')
        super().end_headers()

    def log_message(self, format, *args):
        # Log limpo e discreto apenas com requisições principais
        msg = format % args
        if not msg.startswith('"GET /assets/'):
            sys.stdout.write(f"[{self.log_date_time_string()}] {self.client_address[0]} -> {msg}\n")
            sys.stdout.flush()

def main():
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    best_ip = get_best_local_ip()
    all_ips = get_all_candidate_ips()

    # Inicia o servidor HTTP multithread (atende múltiplos alunos ao mesmo tempo)
    try:
        server = ThreadingHTTPServer(('0.0.0.0', PORT), CustomHTTPHandler)
    except OSError as e:
        if e.errno in (98, 10048):
            print(f"\n[ERRO] A porta {PORT} ja esta em uso por outro programa!")
            print(f"Feche o outro servidor ou tente uma porta diferente.")
            sys.exit(1)
        raise

    print("\n" + "=" * 68)
    print("        BANCADA DE ROBOTICA - SERVIDOR DE AULAS NA REDE LOCAL")
    print("=" * 68)
    print(" [OK] Servidor iniciado com sucesso!")
    print(" [OK] 100% OFFLINE (Nao precisa de internet).")
    print()
    print(" >>> O QUE DIGITAR NOS COMPUTADORES DOS ALUNOS: <<<")
    print(" Conecte os computadores/tablets no mesmo Wi-Fi e digite no navegador:")
    print()
    print(f"      http://{best_ip}:{PORT}")
    print()

    # Se houver outros adaptadores (VPN, etc.), mostra como alternativas
    outros = [ip for ip in all_ips if ip != best_ip and not ip.startswith('172.31.')]
    if outros:
        print(f" (Outros IPs detectados nesta maquina: {', '.join(outros)})")
        print()

    print(" >>> NESTE COMPUTADOR (PROFESSOR): <<<")
    print(f"      http://localhost:{PORT}")
    print("=" * 68)
    print(" Dica: Se o navegador dos alunos nao carregar, confirme se o Firewall")
    print(" do Windows permitiu o acesso para redes privadas.")
    print(" Pressione CTRL + C para encerrar o servidor ao final da aula.")
    print("=" * 68 + "\n")

    # Abre a página no computador local
    try:
        webbrowser.open(f"http://localhost:{PORT}")
    except Exception:
        pass

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n[Encerrando servidor de aulas...]")
        server.server_close()
        print("[Servidor finalizado com sucesso.]\n")

if __name__ == '__main__':
    main()
