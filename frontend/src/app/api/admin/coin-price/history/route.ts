import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    console.log('Coin fiyatı geçmişi API çağrısı başladı');
    
    // Kullanıcı kimliğini doğrula
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      console.log('Token bulunamadı');
      return NextResponse.json({ message: 'Kimlik doğrulama gerekli' }, { status: 401 });
    }

    // Query parametrelerini al
    const searchParams = req.nextUrl.searchParams;
    const limit = searchParams.get('limit') || '30'; // Varsayılan olarak son 30 kayıt
    console.log('İstek parametreleri:', { limit });

    // Backend API'den coin fiyatı geçmişini al
    console.log('Backend API çağrısı yapılıyor');
    
    // Admin routes altındaki coin-price/history endpoint'ini kullan
    const apiUrl = `http://localhost:8000/api/admin/coin-price/history?limit=${limit}`;
    
    console.log('API URL:', apiUrl);
    
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      cache: 'no-store'
    });
    
    console.log('API yanıt statusu:', response.status);
    
    if (!response.ok) {
      console.error('API yanıt hata:', response.status, response.statusText);
      try {
        const errorData = await response.json();
        console.error('Hata detayları:', errorData);
        return NextResponse.json(
          { message: errorData.message || 'Coin fiyatı geçmişi alınamadı' }, 
          { status: response.status }
        );
      } catch (jsonError) {
        console.error('Hata yanıtı JSON olarak ayrıştırılamadı', jsonError);
        return NextResponse.json(
          { message: 'Coin fiyatı geçmişi alınamadı' }, 
          { status: response.status }
        );
      }
    }
    
    const data = await response.json();
    console.log('API yanıt başarılı, veri sayısı:', data.length);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Coin fiyatı geçmişi getirme hatası:', error);
    return NextResponse.json(
      { message: 'Coin fiyatı geçmişi alınırken bir hata oluştu' }, 
      { status: 500 }
    );
  }
} 