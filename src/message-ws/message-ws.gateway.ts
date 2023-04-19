import { NewMessageDto } from './dtos/new-message.dto';
import { 
  WebSocketGateway, 
  OnGatewayConnection, 
  OnGatewayDisconnect, 
  WebSocketServer,
  SubscribeMessage
  
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Socket, Server } from 'socket.io'
import { MessageWsService } from './message-ws.service';
import { JwtPayload } from '../auth/interfaces';

@WebSocketGateway({ cors: true })
export class MessageWsGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer() wss: Server;

  constructor(
    private readonly messageWsService: MessageWsService,
    private readonly jwtService: JwtService
    ) {}

  async handleConnection(client: Socket, ...args: any[]) {
    const token = client.handshake.headers.authentication as string;
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify(token);
      await this.messageWsService.registerClient( client, payload.id );
    } catch (error) {
      client.disconnect();
      return;
    }

    console.log({ payload })
    
    // console.log(client);
    // console.log('Client connected:', client.id);
    //console.log({ connected: this.messageWsService.getConnectedClients() });
    // client.join('ventas');
    // client.join(client.id);
    // client.join(user.email)
    // this.wss.to('ventas').emit('');

    this.wss.emit('clients-updated', this.messageWsService.getConnectedClientsIds());
  }
  handleDisconnect(client: Socket, ...args: any[]) {
    // console.log('Client desconnected:', client.id);
    this.messageWsService.removeClient(client.id);
    //console.log({ connected: this.messageWsService.getConnectedClients() });
    this.wss.emit('clients-updated', this.messageWsService.getConnectedClientsIds());
  }

  //message-from-client
  @SubscribeMessage('message-from-client')
  onMessageFromClient(client: Socket, payload: NewMessageDto){
    // console.log(client.id, payload);
    //!This emit only the client
    // client.emit('message-from-server',{
    //   fullName: 'Soy Yo!',
    //   message: payload.message || 'no-message!!'
    // });

    //!Emit to everyone, but not current client
    // client.broadcast.emit('message-from-server',{
    //   fullName: `It's me!`,
    //   message: payload.message || 'no-message!!'
    // });

    // this.wss.to('CliendID')
    console.log(payload);
    this.wss.emit('message-from-server',{
        fullName: this.messageWsService.getUserFullName(client.id),
        message: payload.message || 'no-message!!'
    });

  }
}
